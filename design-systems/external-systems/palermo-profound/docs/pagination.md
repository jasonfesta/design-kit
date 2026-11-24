# Pagination

Source: https://palermo.tryprofound.com/docs/pagination

## Pagination 
A navigation component for splitting content across multiple pages. 

## Default 
The default pagination shows item count and navigation arrows. 

 Preview Code 

Showing 21 – 30 of 100 items 

## With Page Indicator 
Shows current page indicator between navigation arrows. 

 Preview Code 

Showing 1 – 10 of 50 items 
 1 / 5 

## Arrows Only 
Minimal pagination with just navigation arrows. 

 Preview Code 

## Loading State 
Disabled state during data fetching. 

 Preview Code 

Showing 1 – 10 of 100 items 

## Empty State 
Handles zero items gracefully. 

 Preview Code 

## Usage 

## Properties 

Prop 
Type 
Description 

 page 

 number 

The current page number (1-based) 

 limit 

 number 

Number of items per page 

 offset 

 number 

Number of items to skip (usually (page - 1) * limit) 

 totalItems 

 number 

Total number of items across all pages 

 onPageChange 

 (page: number) => void 

Callback function called when page changes 

 className 

 string 

Additional CSS classes to apply to the pagination container 

 isLoading 

 boolean 

Whether the pagination is in a loading state 

 showOnlyArrows 

 boolean 

Show only navigation arrows without item count 

 showPageIndicatorBetweenArrows 

 boolean 

Show current page indicator between arrows 

 leftContent 

 React.ReactNode 

Custom content to display on the left side of pagination 

 alignText 

 string 

Set to 'end' to align the item count to the right 

 Previous Multi-step Form 
 Next 
 Pill / Tag
