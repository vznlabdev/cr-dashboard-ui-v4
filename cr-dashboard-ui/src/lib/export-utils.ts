// Export utilities for CSV and JSON downloads

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Format data for CSV export
export function prepareProjectsForExport(projects: any[]) {
  return projects.map(project => ({
    "Project Name": project.name,
    "Description": project.description || "",
    "Status": project.status,
    "Assets": project.assets,
    "Compliance": `${project.compliance}%`,
    "Risk Level": project.risk,
    "Last Updated": project.updated,
    "Owner": project.owner || "",
    "Created": project.createdDate || "",
  }));
}

export function prepareLegalIssuesForExport(issues: any[]) {
  return issues.map(issue => ({
    "Asset": issue.asset,
    "Issue Type": issue.type,
    "Severity": issue.severity,
    "Status": issue.status,
    "Reported": issue.reported,
  }));
}

export function prepareRiskDataForExport(data: {
  riskIndex: string;
  provenanceScore: number;
  totalAssets: number;
  compliancePercentage: number;
}) {
  return {
    "Risk Index": data.riskIndex,
    "Provenance Score": data.provenanceScore,
    "Total Assets": data.totalAssets,
    "Compliance Percentage": `${data.compliancePercentage}%`,
    "Export Date": new Date().toLocaleString(),
  };
}

