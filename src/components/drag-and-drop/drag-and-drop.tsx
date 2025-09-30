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
import { reconcile } from 'solid-js/store';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { TransitionGroup } from 'solid-transition-group';
import { arrayMoveImmutable } from './array-move';

// Context to share a unique instance ID across related drag-and-drop elements.
// This prevents elements from different lists on the same page from interacting.
const InstanceIdContext = createContext<() => string | null>(() => null);

export type DragState = 'idle' | 'dragging' | 'over';

const DraggableListItem = <T,>(props: {
  item: T;
  id: string | number;
  itemType: string;
  children: (state: Accessor<DragState>, ref: (el: HTMLElement) => void) => JSX.Element;
}) => {
  const [state, setState] = createSignal<DragState>('idle');
  let ref!: HTMLElement;
  const instanceId = useContext(InstanceIdContext);

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
          canDrop: ({ source, input }) => {
            // Type assertion for source.data to access custom properties robustly.
            const sourceData = source.data as {
              id: string | number;
              type: string;
              instanceId: string | null;
            };

            const canDrop =
              // Same drag-and-drop instance
              sourceData.instanceId === instanceId() &&
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

/**
 * A generic and headless SolidJS component that provides a drag-and-drop/sortable list.
 * It manages the list's state and handles item reordering (content swap in this case) on drop.
 *
 * Allows for trivial implementation of:
 * - List Drag/Sort
 * - Grid Drag/Sort
 * - Cross-list Drag/Sort i.e. Trello Boards
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
  /** Update the list after a drag. */
  setItems: (newItems: T[]) => void;
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
}) {
  // Generate a unique instance ID for this specific list to prevent cross-list interactions.
  const [instanceId] = createSignal<string>(
    `drag-drop-instance-${Math.random().toString(36).substring(2, 9)}`
  );

  // Monitor for global drag events to handle the actual item reordering.
  createEffect(() => {
    onCleanup(
      monitorForElements({
        // Only monitor events originating from the same drag-and-drop instance.
        canMonitor: ({ source }) => {
          const sourceData = source.data as { instanceId: string | null };
          return sourceData.instanceId === instanceId();
        },
        onDrop: ({ source, location }) => {
          const destination = location.current.dropTargets[0];
          if (!destination) {
            return; // No valid drop target found.
          }

          // Extract IDs from source and destination data. Type assertion handles implicit 'any' errors.
          const startId = (source.data as { id: string | number }).id;
          const destinationId = (destination.data as { id: string | number }).id;

          if (startId === undefined || destinationId === undefined) {
            console.warn("Drag and drop data missing 'id' property. Check `getInitialData`.");
            return;
          }

          // Find the current indices of the start and destination items in the list.
          const startIndex = props.items.findIndex(
            (item) => props.itemIdAccessor(item) === startId
          );
          const destinationIndex = props.items.findIndex(
            (item) => props.itemIdAccessor(item) === destinationId
          );

          if (startIndex === -1 || destinationIndex === -1) {
            console.warn(
              'Dragged item or drop target not found in the list. This may indicate an ID mismatch.'
            );
            return;
          }

          // Use arrayMoveImmutable to reorder the array.
          // This creates a new array with the item at startIndex moved to destinationIndex.
          const reorderedItems = arrayMoveImmutable(props.items, startIndex, destinationIndex);

          // Update the SolidJS store. `reconcile` is used for efficient, deep updates.
          // @ts-ignore
          props.setItems(reconcile(reorderedItems));
        },
      })
    );
  });

  return (
    <InstanceIdContext.Provider value={instanceId}>
      {/* TransitionGroup for smooth animations when items are added/removed/reordered */}
      <TransitionGroup name="group-item">
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
      </TransitionGroup>
    </InstanceIdContext.Provider>
  );
}
