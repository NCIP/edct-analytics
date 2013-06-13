/*L
  Copyright HealthCare IT, Inc.

  Distributed under the OSI-approved BSD 3-Clause License.
  See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
L*/


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