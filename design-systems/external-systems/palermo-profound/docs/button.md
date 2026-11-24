# Button

Source: https://palermo.tryprofound.com/docs/button

## Button 
Trigger an action or event, such as submitting a form or displaying a
dialog. 

## Sizes 
The default size is medium. 

 Preview Code 

 Small 
 Regular 
 Large 

## Variants 
The default mode is secondary. 

 Preview Code 

 Primary 
 Secondary 
 Tertiary 
 Ghost 
 Subtle 
 Destructive 
 Dashed 

## Toggle state 
Pair subtle and tertiary for a view switcher. subtle is the off state: transparent background and secondary text, changing to a tertiary background and primary text on hover. tertiary is the selected state: tertiary background and primary text, with no hover change. Both modes use a quaternary background while pressed. Set aria-pressed to expose which view is selected. 

 Preview Code 

## Prefix and Suffix 
The default size is medium. 

 Preview Code 

 Plus 
 Minus 
 Plus and Minus 

## Loading 
Text-only buttons keep the centered spinner overlay so the control does not reflow. Use a fixed width such as w-40 when you want to lock the size during that transition. 

 Preview Code 

 Loading button 

## Loading interactive 
See the loading state transition as the button enters and exits loading. 

 Preview Code 

 Save changes 

## Loading variants 
Compare loading states across the primary, secondary, ghost, destructive, and dashed modes. 

 Preview Code 

 Primary 

 Secondary 

 Ghost 

 Destructive 

 Dashed 

## Loading sizes 
Compare the loading overlay at each supported button size. 

 Preview Code 

 Small 

 Regular 

 Large 

## Loading fixed width 
A fixed width keeps the button size consistent while its loading overlay is visible. 

 Preview Code 

 Save changes 
 Save changes 

## Loading icon toggle 
When the button has an icon, the spinner replaces that icon and the label stays visible. 

 Preview Code 

 Add item 

## Loading with icons 
The spinner replaces the start icon when one exists, the end icon when that is the only icon, and only the start icon when both are present. Icon-only buttons swap the icon for the spinner. Ghost uses its hover background while loading. 

 Preview Code 

 Start icon 
 End icon 
 Both icons 

## Usage 

## Properties 

Prop 
Type 
Description 

 mode 

 'primary' 'secondary' 'tertiary' 'ghost' 'subtle' 'destructive' 'dashed' 

Visual style of the button 

 size 

 'micro' 'small' 'regular' 'large' 

Size of the button on desktop 

 iconStart 

 ReactNode 

Icon to display at the start of the button 

 iconEnd 

 ReactNode 

Icon to display at the end of the button 

 loading 

 { isLoading?: boolean; className?: string; } 

Loading state configuration. Disables the control while loading. Text-only buttons show a centered spinner overlay. When an icon is present the spinner replaces that icon and the label stays visible. 

 contentClassName 

 string 

Custom class name for the button content wrapper 

 allowScaleOnClick 

 boolean 

Whether to allow scale animation on click 

 error 

 boolean 

Whether to display the button in error state 

 className 

 string 

Additional CSS classes to apply to the button 

 children 

 ReactNode 

Button content 

 disabled 

 boolean 

Whether the button is disabled 

 type 

 'button' 'submit' 'reset' 

Button type attribute 

 href 

 string 

URL for link button (renders as Link component) 

 Previous Brand icons 
 Next 
 Card
