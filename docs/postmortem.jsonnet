local fp = import "fiberplane.libsonnet";
local c = fp.cell;
local fmt = fp.format;

function(
  incident_id,
  incident_title,
	environment,
  service
)
  fp.notebook
  .new("Incident: " + incident_id + " - " + incident_title)
  .setTimeRangeRelative(minutes=60)
  .addLabels({
    type: "postmortem",
    environment: environment,
    service: service,
  })
  .addCells([
    c.h1("Incident Overview"),
    c.text(),
    c.h1("Impact"),
    c.text(),
    c.h1("Fix"),
    c.text(),
    c.divider(),
    c.h1("Contributing factors"),
    c.text(),
    c.h1("What did we learn?"),
    c.text(),
    c.h1("Actions"),
    c.listItem.unordered("Action 1"),
    c.listItem.unordered("Action 2..."),
    c.divider(),
    c.h1("Timeline"),
    c.text(),
  ])