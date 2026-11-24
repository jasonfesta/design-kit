# Scroll Area

Source: https://palermo.tryprofound.com/docs/scroll-area

## Scroll Area 
A scroll container with a thin custom scrollbar that matches the product surface. 

## Vertical 
Give the area a fixed height; content past it scrolls. When the content has no focusable children, set viewportLabel so keyboard users can focus the area and scroll it with the arrow keys. 

 Preview Code 

Item 1 : scrollable content 
Item 2 : scrollable content 
Item 3 : scrollable content 
Item 4 : scrollable content 
Item 5 : scrollable content 
Item 6 : scrollable content 
Item 7 : scrollable content 
Item 8 : scrollable content 
Item 9 : scrollable content 
Item 10 : scrollable content 
Item 11 : scrollable content 
Item 12 : scrollable content 

## Horizontal 
Set orientation="horizontal" to render a horizontal scrollbar. A direction without a scrollbar does not scroll. Use "both" for content that scrolls both ways. 

 Preview Code 

1 
2 
3 
4 
5 
6 
7 
8 
9 
10 

## Properties 

Prop 
Type 
Description 

 children 

 ReactNode 

Scrollable content. 

 orientation 

 'vertical' 'horizontal' 'both' 

Scrollbars to render. A direction without a scrollbar does not scroll. 

 viewportLabel 

 string 

Accessible name for the viewport. Also makes it a focusable region, so keyboard users can scroll it. 

 viewportRef 

 Ref<HTMLDivElement> 

Ref to the scrolling viewport, for reading or setting the scroll position. 

 viewportClassName 

 string 

Additional classes for the viewport. 

 scrollbarClassName 

 string 

Additional classes for the scrollbars. 

 className 

 string 

Additional classes for the root. 

 Previous Radio Group 
 Next 
 Section Header
