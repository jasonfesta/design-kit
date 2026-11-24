# Drawer

Source: https://palermo.tryprofound.com/docs/drawer

## Drawer 
A drawer component for displaying content in a slide-out panel from any side
of the screen. 

## Right Drawer 
A drawer that slides in from the right side, perfect for settings and forms. 

 Preview Code 

 Open Right Drawer 

## Left Drawer 
A drawer that slides in from the left side, perfect for navigation menus. 

 Preview Code 

 Open Left Drawer 

## Wide Drawer 
A wider drawer that can accommodate more complex layouts and forms. 

 Preview Code 

 Open Wide Drawer 

## Setup 
Mount <DrawerProvider /> once near the root of your app (inside the
relevant context providers). Nested mounts will render duplicate drawers
because all drawers share the same global Zustand store. 

## Usage 

## Properties 

Prop 
Type 
Description 

 Drawer.Root 

 ComponentPropsWithoutRef<typeof Root> 

Root drawer component that manages the drawer state 

 Drawer.Content 

 ComponentPropsWithoutRef<typeof Content> 

Content container for the drawer 

 Drawer.Header 

 DrawerHeaderProps 

Header component for the drawer with title and close button 

 open 

 boolean 

Controlled open state of the drawer 

 onOpenChange 

 (open: boolean) => void 

Callback fired when the open state changes 

 defaultOpen 

 boolean 

Default open state of the drawer 

 id 

 string 

Unique identifier for the drawer 

 placement 

 'left' 'right' 'top' 'bottom' 

Side of the screen where the drawer appears 

 width 

 number 

Width of the drawer in pixels 

 showCloseButton 

 boolean 

Whether to show the close button in the header 

 preventScroll 

 boolean 

Whether to prevent body scroll when drawer is open 

 header 

 object 

Header configuration with title, back button, navigation, and headerEnd options 

 footer 

 object 

Footer configuration with a customRenderer 

 content 

 ReactNode 

Content rendered inside the drawer 

 withOverlay 

 boolean 

Whether to render the backdrop overlay 

 contentClassName 

 string 

Additional CSS classes for the drawer content area 

 onAnimationEnd 

 (event: AnimationEvent<HTMLDivElement>) => void 

Callback fired when drawer animation ends 

 className 

 string 

Additional CSS classes to apply to the component 

 closeOnEsc 

 boolean 

Whether to close drawer when escape key is pressed 

 closeOnOutsideClick 

 boolean 

Whether to close drawer when clicking outside 

 onClose 

 () => void 

Callback fired when drawer is closed 

 beforeClose 

 () => boolean 

Callback fired before closing, return false to prevent close 

 Previous Dialog 
 Next 
 Dropdown Menu
