# Dialog

Source: https://palermo.tryprofound.com/docs/dialog

## Dialog 
A modal dialog component for displaying content in an overlay. 

## Basic Usage 
Dialogs provide a way to display content in an overlay that requires user interaction. 

 Preview Code 

 Open Dialog 

## Controlled Dialog 
Dialogs can be controlled externally using state management. 

 Preview Code 

 Open Controlled Dialog 

## Without Close Button 
Dialogs can be configured to hide the default close button. 

 Preview Code 

 Open Dialog (No Close Button) 

## Usage 

## Properties 

Prop 
Type 
Description 

 Dialog.Root 

 ComponentPropsWithoutRef<typeof Root> 

Root dialog component that manages the dialog state 

 Dialog.Trigger 

 ComponentPropsWithoutRef<typeof Trigger> 

Trigger element that opens the dialog 

 Dialog.Content 

 ComponentPropsWithoutRef<typeof Content> 

Content container for the dialog 

 Dialog.Overlay 

 ComponentPropsWithoutRef<typeof Overlay> 

Backdrop rendered behind the dialog content 

 open 

 boolean 

Controlled open state of the dialog 

 onOpenChange 

 (open: boolean) => void 

Callback fired when the open state changes 

 defaultOpen 

 boolean 

Default open state of the dialog 

 modal 

 boolean 

Whether the dialog is modal (traps focus) 

 asChild 

 boolean 

Whether to merge props with the child element 

 showCloseButton 

 boolean 

Whether to show the default close button 

 disablePortal 

 boolean 

Render in the current context instead of a portal 

 hideOverlay 

 boolean 

Do not render the dialog's own overlay 

 overlayZIndex 

 'dialog' 'drawer' 

Overlay stacking layer 

 withBackdropBlur 

 boolean 

Apply a backdrop blur to the overlay 

 darkerBackground 

 boolean 

Use a darker overlay background 

 className 

 string 

Additional CSS classes to apply to the component 

 onOpenAutoFocus 

 (event: Event) => void 

Callback fired when the dialog opens and auto-focuses 

 onCloseAutoFocus 

 (event: Event) => void 

Callback fired when the dialog closes and auto-focuses 

 onEscapeKeyDown 

 (event: KeyboardEvent) => void 

Callback fired when the escape key is pressed 

 onPointerDownOutside 

 (event: PointerEvent) => void 

Callback fired when clicking outside the dialog 

 onInteractOutside 

 (event: Event) => void 

Callback fired when interacting outside the dialog 

 Previous Question Tool 
 Next 
 Drawer
