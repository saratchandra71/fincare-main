
// src/lib/rulesSchema.ts
export type Pillar = 'products-services' | 'price-value' | 'consumer-understanding' | 'consumer-support'
export type Operator = '>'|'>='|'<'|'<='|'=='|'!='|'contains'|'not_contains'|'regex'|'delta_gt'|'delta_lt'|'lag_days_gt'|'is_yes'|'is_no'
export type Severity = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
export type Condition = { left: string; op: Operator; right?: string|number; rightField?: string }
export type Rule = { id: string; code: string; name: string; severity: Severity; all?: boolean; conditions: Condition[]; message: string; extra?: string }
export type RuleSet = { pillar: Pillar; rules: Rule[] }
export type Evaluation = { id: string; title: string; severity: 'review'|'critical'|'high'|'medium'|'low'; messages: { text: string, extra?: string }[] }
