// NOT A SOLID-UI / SHADCN COMPONENT. CUSTOM BY CARLO
// I find that this is the better "shadcn" implementation for the daypicker.
// Maximizes flexibility + reusability.
// date-picker.tsx is untouched and completely from solid-ui.

import { createMemo, Index } from "solid-js"
import { Portal } from "solid-js/web"
import { cn } from "@/utils/cn"
import {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerNextTrigger,
  DatePickerPositioner,
  DatePickerPrevTrigger,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
} from "./date-picker"

const CalendarCompContent = (props: {
  class?: string
  "aria-label"?: string
  isRange?: boolean
  inPopover?: boolean
}) => {
  const dayView = (
    <DatePickerView view="day">
      <DatePickerContext>
        {(api) => {
          const offset = createMemo(() => api().getOffset?.({ months: 1 }))
          return (
            <>
              <DatePickerViewControl>
                <DatePickerPrevTrigger />
                <DatePickerViewTrigger>
                  <DatePickerRangeText />
                </DatePickerViewTrigger>
                <DatePickerNextTrigger />
              </DatePickerViewControl>
              {props.isRange ? (
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DatePickerTable>
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        <Index each={api().weekDays}>
                          {(weekDay) => (
                            <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>
                          )}
                        </Index>
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      <Index each={api().weeks}>
                        {(week) => (
                          <DatePickerTableRow>
                            <Index each={week()}>
                              {(day) => (
                                <DatePickerTableCell value={day()}>
                                  <DatePickerTableCellTrigger>
                                    {day().day}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </Index>
                          </DatePickerTableRow>
                        )}
                      </Index>
                    </DatePickerTableBody>
                  </DatePickerTable>
                  <DatePickerTable>
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        <Index each={api().weekDays}>
                          {(weekDay) => (
                            <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>
                          )}
                        </Index>
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      <Index each={offset()?.weeks}>
                        {(week) => (
                          <DatePickerTableRow>
                            <Index each={week()}>
                              {(day) => (
                                <DatePickerTableCell
                                  value={day()}
                                  visibleRange={offset()?.visibleRange}
                                >
                                  <DatePickerTableCellTrigger>
                                    {day().day}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </Index>
                          </DatePickerTableRow>
                        )}
                      </Index>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </div>
              ) : (
                <DatePickerTable>
                  <DatePickerTableHead>
                    <DatePickerTableRow>
                      <Index each={api().weekDays}>
                        {(weekDay) => (
                          <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>
                        )}
                      </Index>
                    </DatePickerTableRow>
                  </DatePickerTableHead>
                  <DatePickerTableBody>
                    <Index each={api().weeks}>
                      {(week) => (
                        <DatePickerTableRow>
                          <Index each={week()}>
                            {(day) => (
                              <DatePickerTableCell value={day()}>
                                <DatePickerTableCellTrigger>{day().day}</DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            )}
                          </Index>
                        </DatePickerTableRow>
                      )}
                    </Index>
                  </DatePickerTableBody>
                </DatePickerTable>
              )}
            </>
          )
        }}
      </DatePickerContext>
    </DatePickerView>
  )

  const monthView = (
    <DatePickerView view="month">
      <DatePickerContext>
        {(api) => (
          <>
            <DatePickerViewControl>
              <DatePickerPrevTrigger />
              <DatePickerViewTrigger>
                <DatePickerRangeText />
              </DatePickerViewTrigger>
              <DatePickerNextTrigger />
            </DatePickerViewControl>
            <DatePickerTable>
              <DatePickerTableBody>
                <Index each={api().getMonthsGrid({ columns: 4, format: "short" })}>
                  {(months) => (
                    <DatePickerTableRow>
                      <Index each={months()}>
                        {(month) => (
                          <DatePickerTableCell value={month().value}>
                            <DatePickerTableCellTrigger>{month().label}</DatePickerTableCellTrigger>
                          </DatePickerTableCell>
                        )}
                      </Index>
                    </DatePickerTableRow>
                  )}
                </Index>
              </DatePickerTableBody>
            </DatePickerTable>
          </>
        )}
      </DatePickerContext>
    </DatePickerView>
  )

  const yearView = (
    <DatePickerView view="year">
      <DatePickerContext>
        {(api) => (
          <>
            <DatePickerViewControl>
              <DatePickerPrevTrigger />
              <DatePickerViewTrigger>
                <DatePickerRangeText />
              </DatePickerViewTrigger>
              <DatePickerNextTrigger />
            </DatePickerViewControl>
            <DatePickerTable>
              <DatePickerTableBody>
                <Index each={api().getYearsGrid({ columns: 4 })}>
                  {(years) => (
                    <DatePickerTableRow>
                      <Index each={years()}>
                        {(year) => (
                          <DatePickerTableCell value={year().value}>
                            <DatePickerTableCellTrigger>{year().label}</DatePickerTableCellTrigger>
                          </DatePickerTableCell>
                        )}
                      </Index>
                    </DatePickerTableRow>
                  )}
                </Index>
              </DatePickerTableBody>
            </DatePickerTable>
          </>
        )}
      </DatePickerContext>
    </DatePickerView>
  )

  return (
    <DatePickerContent
      class={cn(
        (props.inPopover ?? false) &&
          "data-[state=closed]:animate-flyUpAndScaleExit data-[state=open]:animate-flyUpAndScale",
        props.class
      )}
      aria-label={props["aria-label"]}
    >
      {dayView}
      {monthView}
      {yearView}
    </DatePickerContent>
  )
}

// ---

const CalendarComp = (props: {
  value?: Date
  onChange?: (date: Date) => void
  defaultValue?: Date
  class?: string
  "aria-label"?: string
  withControls?: boolean
  format?: (date: Date) => string
  open?: boolean
}) => {
  const isOpen = () => (props.withControls ? props.open : true)

  return (
    <DatePicker
      open={isOpen()}
      value={props.value ? [props.value] : (undefined as any)}
      onValueChange={(details) => props.onChange?.(details.value[0] as any) as any}
      defaultValue={props.defaultValue ? [props.defaultValue] : (undefined as any)}
      format={props.format as any}
    >
      {props.withControls && (
        <>
          <DatePickerControl>
            <DatePickerInput placeholder="Pick a date" />
            <DatePickerTrigger />
          </DatePickerControl>
          <Portal>
            <DatePickerPositioner class="group/positioner">
              <CalendarCompContent class={props.class} aria-label={props["aria-label"]} inPopover />
            </DatePickerPositioner>
          </Portal>
        </>
      )}
      {!props.withControls && (
        <CalendarCompContent class={props.class} aria-label={props["aria-label"]} />
      )}
    </DatePicker>
  )
}

const CalendarRangeComp = (props: {
  value?: Date[]
  onChange?: (dates: Date[]) => void
  defaultValue?: Date[]
  class?: string
  "aria-label"?: string
  format?: (date: Date) => string
  withPicker?: boolean
  open?: boolean
}) => {
  const isOpen = () => (props.withPicker ? props.open : true)

  return (
    <DatePicker
      open={isOpen()}
      selectionMode="range"
      numOfMonths={2}
      value={props.value as any}
      onValueChange={(details) => props.onChange?.(details.value as any)}
      defaultValue={props.defaultValue as any}
      format={props.format as any}
    >
      {props.withPicker && (
        <>
          <DatePickerControl>
            <DatePickerInput index={0} />
            <DatePickerInput index={1} />
            <DatePickerTrigger />
          </DatePickerControl>
          <Portal>
            <DatePickerPositioner class="group/positioner">
              <CalendarCompContent
                isRange
                class={props.class}
                aria-label={props["aria-label"]}
                inPopover
              />
            </DatePickerPositioner>
          </Portal>
        </>
      )}
      {!props.withPicker && (
        <CalendarCompContent isRange class={props.class} aria-label={props["aria-label"]} />
      )}
    </DatePicker>
  )
}

export { CalendarComp, CalendarRangeComp }
