# Table

Source: https://palermo.tryprofound.com/docs/table

## Table 
A type-safe data table with custom cells, sortable headers, and expandable rows. 

## Basic table 
 createTable<Row>() returns a table bound to one row type, so every column callback is typed. 

 Preview Code 

 Name Owner Status Updated 
 Visibility report Jason 
 Ready Today 
 Competitor brief Maya 
 Draft Yesterday 
 Citation review Priya 
 Needs review Monday 

## Sortable columns 
The consumer owns the sort. Set sortDirection on the sorted column so the header gets aria-sort . 

 Preview Code 

 Name ↑ Owner ↕ Updated ↕ Status 
 Citation review Priya Monday 
 Needs review 
 Competitor brief Maya Yesterday 
 Draft 
 Visibility report Jason Today 
 Ready 

## Expandable rows 

 Preview Code 

 Name Owner Status 
 Visibility report Jason Ready 
 Competitor brief Maya Draft 
 Citation review Priya Needs review 

## Action cells 

 Preview Code 

 Name Status Actions 
 Visibility report 
 Ready 
 Open 
 Competitor brief 
 Draft 
 Open 
 Citation review 
 Needs review 
 Open 

## Table Properties 

Prop 
Type 
Description 

 data 

 T[] 

Rows to render. 

 rowKey 

 keyof T ((row: T, index: number) => React.Key) 

Property or function that returns a stable row key. 

 expandedRows 

 React.Key[] 

Keys of the rows that are expanded. 

 onToggleExpand 

 (rowKey: React.Key, isExpanded: boolean) => void 

Called when a row is expanded or collapsed. 

 isLoading 

 boolean 

Shows loadingState, or skeleton cells when loadingState is not set. 

 loadingState 

 ReactNode 

Content shown while loading. 

 emptyState 

 ReactNode 

Content shown when data is empty. 

 density 

 'default' 'comfortable' 

comfortable fixes a 40px header row and 56px body rows. 

 headerWeight 

 'medium' 'regular' 'mini' 

Typography of the header cells. 

 fixedHeader 

 boolean 

Keeps the header pinned while the body scrolls. 

 disableCardStyles 

 boolean 

Removes the card border and background around the table. 

 wrapperClassName 

 string 

Additional classes for the wrapper. 

## Table.Column Properties 

Prop 
Type 
Description 

 id 

 string 

Unique column identifier. 

 label 

 ReactNode 

Header content. 

 getValue 

 (row: T, index: number) => ReactNode 

Returns the cell content inside the default cell. 

 renderCell 

 (row: T, index: number) => ReactNode 

Renders the whole td for full control. 

 renderHeader 

 (column: TableColumnProps<T>) => ReactNode 

Renders the whole th for full control. 

 sortDirection 

 'asc' 'desc' 

Active sort direction. Sets aria-sort on the header cell so screen readers announce the sort. Set it only on the sorted column. 

 align 

 'left' 'center' 'right' 

Text alignment. 

## Table.ExpandableRow Properties 

Prop 
Type 
Description 

 render 

 (row: T, index: number) => ReactNode 

Content shown below an expanded row. 

 Previous Switch 
 Next 
 Tabs
