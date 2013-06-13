/*L
  Copyright HealthCare IT, Inc.

  Distributed under the OSI-approved BSD 3-Clause License.
  See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
L*/


ALTER TABLE "CaHope"."report_templates"
ADD COLUMN "owner_id" bigint;

ALTER TABLE "CaHope"."report_templates"
ADD CONSTRAINT "report_owner_fk"
FOREIGN KEY ("owner_id")
REFERENCES "CaHope"."user"("id")
ON DELETE CASCADE;