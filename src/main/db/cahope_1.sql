/*L
  Copyright HealthCare IT, Inc.

  Distributed under the OSI-approved BSD 3-Clause License.
  See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
L*/

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




