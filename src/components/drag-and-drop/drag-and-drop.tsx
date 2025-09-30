import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  For,
  JSX,
  onCleanup,
  useContext,
} from 'solid-js';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

// Context to share a unique instance ID across related drag-and-drop elements.
// This prevents elements from different lists on the same page from interacting.
type DraggableContextValue = {
  instanceId: Accessor<string | null>;
  extraInstanceIds: string[] | undefined;
};

const DraggableContext = createContext<DraggableContextValue>({
  instanceId: () => null,
  extraInstanceIds: undefined,
} satisfies DraggableContextValue);

export type DragState = 'idle' | 'dragging' | 'over';

const DraggableListItem = <T,>(props: {
  item: T;
  id: string | number;
  itemType: string;
  children: (state: Accessor<DragState>, ref: (el: HTMLElement) => void) => JSX.Element;
}) => {
  const [state, setState] = createSignal<DragState>('idle');
  let ref!: HTMLElement;
  const { instanceId, extraInstanceIds } = useContext(DraggableContext);

  createEffect(() => {
    // Combine draggable and drop target behaviors for the element.
    // Cleanup is handled automatically when the effect re-runs or the component unmounts.
    onCleanup(
      combine(
        draggable({
          element: ref,
          // Initial data provided when this item starts being dragged.
          getInitialData: () =>
            ({
              type: props.itemType,
              id: props.id,
              instanceId: instanceId(),
            }) as { type: string; id: string | number; instanceId: string | null }, // Explicit type for data
          onDragStart: () => setState('dragging'),
          onDrop: () => setState('idle'), // Reset state after drag ends
        }),
        dropTargetForElements({
          element: ref,
          // Data provided when this element is a potential drop target.
          getData: () => ({ id: props.id }) as { id: string | number }, // Explicit type for data
          getIsSticky: () => true, // Allows dropping directly onto the element.
          canDrop: ({ source, input: _ }) => {
            // Type assertion for source.data to access custom properties robustly.
            const sourceData = source.data as {
              id: string | number;
              type: string;
              instanceId: string | null;
            };

            const allowedInstanceIds =
              sourceData.instanceId === instanceId() ||
              (extraInstanceIds
                ? extraInstanceIds.includes(sourceData.instanceId as string)
                : false);

            const canDrop =
              allowedInstanceIds &&
              // Same item type
              sourceData.type === props.itemType &&
              // Not dragging onto itself.
              sourceData.id !== props.id;

            return canDrop;
          },
          onDragEnter: () => setState('over'), // Set state when a draggable item enters this target.
          onDragLeave: () => setState('idle'), // Reset state when a draggable item leaves.
          onDrop: () => setState('idle'), // Reset state after drop.
        })
      )
    );
  });

  // eslint-disable-next-line solid/reactivity
  return props.children(state, (el) => (ref = el));
};

export type OnDropEvent<T extends object> = {
  sourceId: string | number;
  targetId: string | number;
  sourceIndex: number;
  targetIndex: number;
  sourceData: T;
  targetData: T;
  sourceInstanceId: string | null;
  targetInstanceId: string | null;
};
export type OnDropHandler<T extends object> = (params: OnDropEvent<T>) => void;
/**
 * A generic and headless SolidJS component that provides a drag-and-drop/sortable list.
 * It manages the list's state and handles item reordering (content swap in this case) on drop.
 *
 * Allows for trivial implementation of:
 * - List Drag/Sort
 * - Grid Drag/Sort
 * - Board (Cross-list) Drag/Sort i.e. Trello Boards
 *
 * IMPORTANT: Make sure the item has 'transition' class in tailwind (or similar) to get animations.
 *
 * Example:
 * ```tsx
 * <DragAndDropList items={list} setItems={setList} itemIdAccessor={(item) => item.id}>
 *   {(props) => (
 *     <div ref={props.ref} class="transition-all">
 *       {props.item.name} — {props.state()}
 *     </div>
 *   )}
 * </DragAndDropList>
 * ```
 *
 * This is built on top of @atlaskit/pragmatic-drag-and-drop + solid-transition-group.
 * Feel free to reverse-engineer the implementation
 */
export default function DragAndDropList<T extends object>(props: {
  /** The array of items to display and manage. */
  items: T[];
  /** Return a unique id for each item. */
  itemIdAccessor: (item: T) => string | number;
  /** Optional type string; default "list-item". */
  itemType?: string;
  /** Render each item. Provides { item, state, ref }. */
  children: (props: {
    item: T;
    state: Accessor<DragState>;
    ref: (_ref: HTMLElement) => void;
  }) => JSX.Element;
  /** Extra instance IDs that this list should accept/interact with for cross-list drag-and-drop. */
  extraInstanceIds?: string[];
  /** Optional custom instance ID to override the default generated one. */
  instanceId?: string;
  /** Callback fired when an item is dropped. Provides detailed information about the drag operation. */
  onDrop: OnDropHandler<T>;
}) {
  // Generate or use a provided unique instance ID for this specific list to prevent cross-list interactions.
  const [instanceId] = createSignal<string>(
    // eslint-disable-next-line solid/reactivity
    props.instanceId || `drag-drop-instance-${Math.random().toString(36).substring(2, 9)}`
  );

  // Monitor for global drag events to handle the actual item reordering.
  createEffect(() => {
    onCleanup(
      monitorForElements({
        // Allow monitoring events from the same drag-and-drop instance or any extra instances.
        canMonitor: ({ source }) => {
          const sourceData = source.data as { instanceId: string | null };

          console.log('HELLO', source);
          return (
            sourceData.instanceId === instanceId() ||
            (props.extraInstanceIds
              ? props.extraInstanceIds.includes(sourceData.instanceId as string)
              : false)
          );
        },
        onDrop: ({ source, location }) => {
          const target = location.current.dropTargets[0];
          if (!target) {
            return; // No valid drop target found.
          }

          // Extract IDs from source and target data. Type assertion handles implicit 'any' errors.
          const sourceId = (source.data as { id: string | number }).id;
          const targetId = (target.data as { id: string | number }).id;

          if (sourceId === undefined || targetId === undefined) {
            console.warn("Drag and drop data missing 'id' property. Check `getInitialData`.");
            return;
          }

          // Helper to get nth child index of an element within its parent
          const getElementIndex = (el: HTMLElement): number => {
            let index = 0;
            let sibling = el.previousElementSibling;
            while (sibling) {
              index++;
              sibling = sibling.previousElementSibling;
            }
            return index;
          };

          const sourceIndex = source.element ? getElementIndex(source.element) : -1;
          const targetIndex = target.element ? getElementIndex(target.element) : -1;

          const sourceInstanceId = (source.data as { instanceId: string | null }).instanceId;
          const targetInstanceId = instanceId();

          // Note: sourceData and targetData are not available here for cross-list drops,
          // so we pass undefined. The consumer should look up the data using the IDs.
          props.onDrop?.({
            sourceId,
            targetId,
            sourceIndex,
            targetIndex,
            sourceData: undefined as any,
            targetData: undefined as any,
            sourceInstanceId,
            targetInstanceId,
          });
        },
      })
    );
  });

  return (
    <DraggableContext.Provider
      value={{
        instanceId,
        // eslint-disable-next-line solid/reactivity
        extraInstanceIds: props.extraInstanceIds,
      }}
    >
      {/* TransitionGroup for smooth animations when items are added/removed/reordered */}
      {/*<TransitionGroup name="group-item">*/}
      <For each={props.items}>
        {(item) => (
          <DraggableListItem
            item={item} // Pass the full item, although DraggableListItem only needs its ID
            id={props.itemIdAccessor(item)} // Unique ID for this specific item
            itemType={props.itemType || 'list-item'} // Type of draggable item
          >
            {/* The children prop of DraggableListItem receives the drag state */}
            {(state, ref) => props.children({ item, state, ref })}
          </DraggableListItem>
        )}
      </For>
      {/*</TransitionGroup>*/}
    </DraggableContext.Provider>
  );
}
