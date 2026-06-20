insert into categories (name, type, is_default) values
  -- expense defaults
  ('Food',            'expense', true),
  ('Rent',            'expense', true),
  ('Transport',       'expense', true),
  ('Academic',        'expense', true),
  ('Airtime & Data',  'expense', true),
  ('Entertainment',   'expense', true),
  ('Health',          'expense', true),
  ('Personal Care',   'expense', true),
  ('Other',           'expense', true),
  -- income defaults
  ('Allowance',       'income',  true),
  ('Scholarship',     'income',  true),
  ('Part-Time Work',  'income',  true),
  ('Gift',            'income',  true),
  ('Refund',          'income',  true),
  ('Other',           'income',  true)
on conflict do nothing;
