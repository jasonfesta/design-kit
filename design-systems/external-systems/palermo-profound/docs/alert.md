# Alert

Source: https://palermo.tryprofound.com/docs/alert

## Alert 
An inline callout for information, warnings, success, and errors. 

## Variants 
 warning and destructive render with role="alert" ; default and success render with role="status" . Pass role to override. 

 Preview Code 

How this visibility score works 
It reflects tracked prompts in your category over the selected range. 

Prompt refresh budget is almost used 
You are near this month’s refresh limit for this category. 

Citation export is ready 
Your CSV finished generating and is ready to download. 

Answer engine data did not load 
We could not load responses for this run. Retry shortly. 

## Compositions 
Every part is optional. Wrap a title and description in AlertContent so they stack. 

 Preview Code 

GA4 mapping is incomplete for this domain. 

Select a category to compare brands 

IndexNow pings supported engines when you publish. 

## Alert Properties 

Prop 
Type 
Description 

 variant 

 'default' 'warning' 'destructive' 'success' 

Surface tint and icon color. AlertIcon inherits it. 

 role 

 string 

Overrides the live-region role chosen from the variant. 

 className 

 string 

Additional classes for the container. 

## AlertIcon Properties 

Prop 
Type 
Description 

 variant 

 'default' 'warning' 'destructive' 'success' 

Overrides the icon tint from the enclosing Alert. 

 Previous Active Bar 
 Next 
 Audio Player
