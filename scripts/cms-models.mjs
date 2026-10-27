// Four editorial APIs plus the existing news-template category API fit Hobby's 5-API limit.
const field = (fieldId, name, kind = 'text', required = true, extra = {}) => ({
  fieldId,
  name,
  kind,
  required,
  ...extra,
});
const custom = (fieldId, name, fields) => ({
  fieldId,
  name,
  fields,
  fieldOrderByColumn: [fields.map((f) => f.fieldId)],
});
export const models = [
  {
    name: '募集状況・授業時間・料金・実績概要',
    endpoint: 'site',
    type: 'object',
    allowAdditionalCharge: false,
    apiFields: [
      field('acceptance', '受講生の募集状況', 'textArea'),
      field('universityLabel', '大学受験の見出し'),
      field('universitySummary', '大学の合格校一覧', 'textArea'),
      field('highschoolLabel', '高校受験の見出し'),
      field('highschoolSummary', '高校の合格校一覧', 'textArea'),
      field('priceNote', '料金の補足（例：1コマ80分）'),
      field('juniorFee', '中学生の料金'),
      field('highFee', '高校生の料金'),
      field('priceFooter', '料金表の下の注意書き', 'textArea'),
      field('schedule', '授業開始時間', 'repeater', true, { customFieldIds: ['scheduleRow'] }),
      field('examples', '受講例と料金', 'repeater', true, { customFieldIds: ['priceRow'] }),
    ],
    customFields: [
      custom('scheduleRow', '曜日と時間', [
        field('label', '曜日'),
        field('value', '開始時間', 'textArea'),
      ]),
      custom('priceRow', '受講例', [field('label', 'コース名'), field('value', '料金')]),
    ],
  },
  {
    name: '年度別の合格実績',
    endpoint: 'achievements',
    type: 'list',
    allowAdditionalCharge: false,
    apiFields: [
      field('year', '年度', 'number'),
      field('high', '高校生の人数', 'number'),
      field('ronin', '浪人生の人数', 'number'),
      field('junior', '中学生の人数', 'number'),
      field('groups', '大学・高校・中学の合格実績', 'repeater', true, {
        customFieldIds: ['resultGroup'],
      }),
    ],
    customFields: [
      custom('resultGroup', '受験区分', [
        field('label', '区分（大学受験・高校受験・中学受験）'),
        field('items', '合格校', 'repeater', false, { customFieldIds: ['resultRow'] }),
      ]),
      custom('resultRow', '学校と人数', [
        field('school', '学校名'),
        field('department', '学部・学科', 'text', false),
        field('count', '合格人数（省略可）', 'number', false),
        field('note', '備考', 'textArea', false),
      ]),
    ],
  },
  {
    name: '休講日カレンダー（月ごとに公開）',
    endpoint: 'calendar',
    type: 'list',
    allowAdditionalCharge: false,
    apiFields: [
      field('month', '対象月（例：2026-10）'),
      field('days', '休講日', 'repeater', false, { customFieldIds: ['holiday'] }),
      field('note', '補足', 'textArea', false),
    ],
    customFields: [
      custom('holiday', '休講日', [field('day', '日付', 'date', true, { dateFormat: true })]),
    ],
  },
];
