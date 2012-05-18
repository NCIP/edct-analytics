CREATE ROLE cahope LOGIN
  ENCRYPTED PASSWORD 'md51eaddb49a4c5ec54b9fee936f11a8c81'
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;

CREATE SCHEMA "CaHope"
  AUTHORIZATION cahope;
GRANT ALL ON SCHEMA "CaHope" TO cahope;
GRANT ALL ON SCHEMA "CaHope" TO public;

-- Sequence: "CaHope".report_template_id_seq

-- DROP SEQUENCE "CaHope".report_template_id_seq;

CREATE SEQUENCE "CaHope".report_template_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 21
  CACHE 1;
ALTER TABLE "CaHope".report_template_id_seq OWNER TO cahope;

ALTER ROLE cahope SET search_path="CaHope", public;

-- Table: "CaHope".report_templates

-- DROP TABLE "CaHope".report_templates;

CREATE TABLE "CaHope".report_templates
(
  id bigint NOT NULL DEFAULT nextval('report_template_id_seq'::regclass),
  report character varying(10000),
  title text,
  "timestamp" timestamp without time zone DEFAULT now(),
  CONSTRAINT pk_report_template_id PRIMARY KEY (id),
  CONSTRAINT pk_id_unique UNIQUE (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE "CaHope".report_templates OWNER TO cahope;



CREATE OR REPLACE FUNCTION "CaHope".update_lastmodified_column()
  RETURNS trigger AS
$BODY$
  BEGIN
    NEW.timestamp = NOW();
    RETURN NEW;
  END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "CaHope".update_lastmodified_column() OWNER TO cahope;


CREATE TRIGGER update_lastmodified_modtime
  BEFORE UPDATE
  ON "CaHope".report_templates
  FOR EACH ROW
  EXECUTE PROCEDURE "CaHope".update_lastmodified_column();




