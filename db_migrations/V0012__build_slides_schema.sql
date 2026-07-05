-- Kastomnye slaydy prezentacii dlya kazhdoy sborki.
-- Ves nabor slaydov hranitsya kak JSON: massiv slaydov, kazhdyy slayd -
-- fon + massiv elementov (tekst/foto) s koordinatami, razmerom i stilem.

CREATE TABLE IF NOT EXISTS build_slides (
    build_id INTEGER PRIMARY KEY,
    slides JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER
);