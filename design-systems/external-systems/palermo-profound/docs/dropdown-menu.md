# Dropdown Menu

Source: https://palermo.tryprofound.com/docs/dropdown-menu

## Dropdown Menu 
A dropdown menu component for displaying a list of actions or options. 

## Basic Usage 
Dropdown menus provide a way to display a list of actions or options in an overlay. 

 Preview Code 

 Settings 

## With Groups and Labels 
Dropdown menus can be organized with groups and labels for better structure. 

 Preview Code 

 Actions 

## With Button Trigger 
Dropdown menus can use a built-in button trigger with chevron icon. 

 Preview Code 

 Options 

## Usage 

## Properties 

Prop 
Type 
Description 

 Dropdown.Root 

 ComponentPropsWithoutRef<typeof Root> 

Root dropdown component that manages the dropdown state 

 Dropdown.Trigger 

 ComponentPropsWithoutRef<typeof Trigger> & Partial<ButtonComponentProps> & { buttonWithChevron?: boolean } 

Trigger element that opens the dropdown 

 Dropdown.Content 

 ComponentPropsWithoutRef<typeof Content> & { withPortal?: boolean; portalContainer?: HTMLElement; pinnedBottom?: ReactNode } 

Content container for the dropdown menu 

 Dropdown.Sub 

 ComponentPropsWithoutRef<typeof Sub> 

Container for a nested submenu 

 Dropdown.SubTrigger 

 ComponentPropsWithoutRef<typeof SubTrigger> & { startIcon?: ReactNode } 

Item that opens a nested submenu 

 Dropdown.SubContent 

 ComponentPropsWithoutRef<typeof SubContent> & { pinnedBottom?: ReactNode } 

Content container for nested submenus 

 Dropdown.Item 

 ComponentPropsWithoutRef<typeof Item> & { start?: ReactNode; end?: ReactNode; href?: string; target?: string } 

Individual dropdown menu item 

 Dropdown.CheckboxItem 

 ComponentPropsWithoutRef<typeof CheckboxItem> & { showOnlyButton?: boolean; onOnlyClick?: () => void } 

Menu item with a checkbox 

 Dropdown.Shortcut 

 KbdProps 

Keyboard shortcut badge pinned to the end of a menu row 

 Dropdown.Label 

 ComponentPropsWithoutRef<typeof Label> 

Label for grouping dropdown items 

 Dropdown.Separator 

 ComponentPropsWithoutRef<typeof Separator> 

Visual separator between dropdown items 

 Dropdown.Group 

 ComponentPropsWithoutRef<typeof Group> 

Group container for related dropdown items 

 open 

 boolean 

Controlled open state of the dropdown 

 onOpenChange 

 (open: boolean) => void 

Callback fired when the open state changes 

 defaultOpen 

 boolean 

Default open state of the dropdown 

 modal 

 boolean 

Whether the dropdown is modal (traps focus) 

 asChild 

 boolean 

Whether to merge props with the child element 

 buttonWithChevron 

 boolean 

Whether to render trigger as a button with chevron icon 

 side 

 'top' 'right' 'bottom' 'left' 

Preferred side of the trigger to render against 

 align 

 'start' 'center' 'end' 

Alignment of the content relative to the trigger 

 sideOffset 

 number 

Distance in pixels from the trigger 

 alignOffset 

 number 

Additional distance in pixels from the trigger 

 withPortal 

 boolean 

Whether to render content in a portal 

 portalContainer 

 HTMLElement 

Container element for the portal 

 restoreTriggerFocus 

 boolean 

Return focus to the trigger when the menu closes, except after an outside click 

 pinnedBottom 

 ReactNode 

Content to pin at the bottom of the dropdown, creating a scrollable area above 

 start 

 ReactNode 

Content to display at the start of the item 

 end 

 ReactNode 

Content to display at the end of the item 

 href 

 string 

URL for link items 

 target 

 string 

Target attribute for link items 

 startIcon 

 ReactNode 

Icon shown before the sub-trigger label 

 showOnlyButton 

 boolean 

Show the 'only' button on checkbox items on hover 

 onOnlyClick 

 () => void 

Callback fired when the 'only' button is clicked 

 disabled 

 boolean 

Whether the dropdown item is disabled 

 className 

 string 

Additional CSS classes to apply to the component 

 Previous Drawer 
 Next 
 Empty & Error States
