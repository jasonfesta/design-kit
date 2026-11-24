# Filter Builder

Source: https://palermo.tryprofound.com/docs/filter-builder

## Filter Builder 
Build one filter condition from a field, operator, and typed value in a joined control. 

## Interactive example 
Each field declares its available operators and whether its value is selected, numeric, or text. Fields, operators, and select options accept type-safe Button icon names or descriptors. 

 Preview Code 

 Assignee 
 is 
 brenolasserre 
{
 "fieldId": "assignee",
 "operatorId": "is",
 "value": "breno"
} 

## Value types 

 select opens a selection menu. Set searchable when the option set benefits from filtering. 

 number renders an inline number input styled as the final button segment, commits on blur or Enter, and validates min , max , and step . Step alignment starts at min when provided and zero otherwise. 

 text renders an inline text input styled as the final button segment. Empty strings clear the value unless allowEmpty is enabled. 

## Compatible field changes 
Changing the field preserves an operator when the new field contains the same operator ID. Otherwise, it uses defaultOperatorId or clears the operator. 
Values reset by default. To preserve a value across related fields, give both value definitions the same compatibilityKey . The value is retained only when it is also valid for the new definition. For example, Assignee and Reviewer can share a user compatibility key. 

## Controlled state 
 FilterBuilder owns only which menu is open. The consumer owns the complete condition and updates it through onConditionChange . 

## Properties 

Prop 
Type 
Description 

 fields 

 readonly FilterBuilderField[] 

Field definitions with their operators, icons, defaults, and value editor configuration. 

 condition 

 FilterCondition 

Controlled fieldId, operatorId, and string, number, or null value. 

 onConditionChange 

 (condition: FilterCondition) => void 

Called with the complete next condition after any segment changes. 

 fieldPlaceholder 

 string 

Label shown before a field is selected. 

 operatorPlaceholder 

 string 

Label shown before an operator is selected. 

 valuePlaceholder 

 string 

Fallback label shown before a value is configured or selected. 

 showFieldSearch 

 boolean 

Shows a search input in the field menu. 

 fieldSearchPlaceholder 

 string 

Placeholder for the optional field search input. 

 size 

 'micro' 'small' 'regular' 'large' 

Shared size for the three joined segments. 

 disabled 

 boolean 

Disables every segment in the condition. 

 withRadixPortal 

 boolean 

Controls portal rendering for field, operator, and select-value menus. 

 align 

 'start' 'center' 'end' 

Aligns selection menus to their trigger segment. 

 ariaLabel 

 string 

Accessible label for the grouped filter condition. 

 className 

 string 

Additional classes for the joined control wrapper. 

 Previous Highlights 
 Next 
 Input
