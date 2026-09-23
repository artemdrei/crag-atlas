-- The name the climbing world uses for this field, 8a.nu included. Views that
-- read the column follow the rename on their own.
alter table public.ticks rename column ascent_style to ascent_type;

-- The grade a climber proposes, not just whether it felt soft or hard, and a
-- comment they can keep to themselves.
alter table public.ticks
  add column grade_vote text,
  add column note_private boolean not null default false;
