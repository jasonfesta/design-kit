# Empty & Error States

Source: https://palermo.tryprofound.com/docs/empty-state

## Empty & Error States 
One shape for "there is nothing here" and "we couldn't load this", so both read the same across pages, cards and
table bodies. 

Reach for EmptyState when a list is genuinely empty, and ErrorState when a request failed. They are separate
components on purpose: telling someone they have no items when the fetch merely broke is the one answer that is
actually wrong, and it is the easiest mistake to make when both states share a branch. 
Resolve the error case before the empty case: 

## Basic 

 Preview Code 

No invoices yet 
Invoices appear here once you bill a customer. 

## With an action 
Only offer one when creating the missing thing is actually possible here. A "New invoice" button on a
"nothing shared with you" state is a dead end — nothing the user does on this screen changes that list. 

 Preview Code 

No invoices yet 
Invoices appear here once you bill a customer. 
 New invoice 

## Without a title 
 title is optional. On a subdued surface — one tab of a card, a small section — a headline plus a sentence
usually says the same thing twice, and the sentence alone carries it. Keep the headline for page-level states,
where the empty view has to stand on its own. 
 ErrorState is the exception: it always renders a headline, falling back to its own copy, because a failure the
reader has to infer from one line of tertiary text is a failure they will read as an empty list. 

 Preview Code 

Chats will appear here. 

## Sizes 
 page stands in for a whole list view, section for a card or one tab of a list, and inline for small
containers where reserving height would look wrong. 

 Preview Code 

No chats here yet 
size="page" 

No chats here yet 
size="section" 

No chats here yet 
size="inline" 

## Error state 
Point onRetry at the query that failed rather than a page reload — reloading discards everything else that
loaded fine. 

 Preview Code 

We couldn't load this 
Something went wrong loading these chats. 
 Try again 

## Without a retry 
Omit onRetry when there is nothing useful to retry — a crashed section, or a failure the user can only resolve
by navigating away. 

 Preview Code 

This section is unavailable 
Refresh the page to try again. 

 Previous Dropdown Menu 
 Next 
 Highlights
