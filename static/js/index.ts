namespace DashboardPage {
  interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    created_at: string;
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
  });

  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/leads");
      const leads: Lead[] = await response.json();

      updateStats(leads);
      displayRecentLeads(leads.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showErrorMessage(
        "Failed to load dashboard data. Please try again later.",
      );
    }
  }
  function updateStats(leads: Lead[]) {
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "new").length;
    const contactedLeads = leads.filter(
      (lead) => lead.status === "contacted",
    ).length;
    const recontactedLeads = leads.filter(
      (lead) => lead.status === "recontacted",
    ).length;
    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "qualified",
    ).length;
    const oniceLeads = leads.filter((lead) => lead.status === "onice").length;
    const closedLeads = leads.filter((lead) => lead.status === "closed").length;

    document.querySelector("#total-leads .stat-value")!.textContent =
      totalLeads.toString();
    document.querySelector("#new-leads .stat-value")!.textContent =
      newLeads.toString();
    document.querySelector("#contacted-leads .stat-value")!.textContent =
      contactedLeads.toString();
    document.querySelector("#recontacted-leads .stat-value")!.textContent =
      recontactedLeads.toString();
    document.querySelector("#qualified-leads .stat-value")!.textContent =
      qualifiedLeads.toString();
    document.querySelector("#onice-leads .stat-value")!.textContent =
      oniceLeads.toString();
    document.querySelector("#closed-leads .stat-value")!.textContent =
      closedLeads.toString();
  }

  function displayRecentLeads(leads: Lead[]) {
    const tableBody = document.getElementById("recent-leads-table")!;
    tableBody.innerHTML = "";

    if (leads.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="4" style="text-align: center;">No leads found</td>`;
      tableBody.appendChild(row);
      return;
    }

    leads.forEach((lead) => {
      const row = document.createElement("tr");

      const date = new Date(lead.created_at);
      const formattedDate = date.toLocaleDateString();

      row.innerHTML = `
            <td><a href="/lead/${lead.id}">${lead.name}</a></td>
            <td>${lead.company || "-"}</td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td>${formattedDate}</td>
        `;

      tableBody.appendChild(row);
    });
  }

  function showErrorMessage(message: string) {
    // Create a simple error message element
    const errorDiv = document.createElement("div");
    errorDiv.style.backgroundColor = "hsl(var(--destructive) / 0.2)";
    errorDiv.style.color = "hsl(var(--destructive))";
    errorDiv.style.padding = "1rem";
    errorDiv.style.borderRadius = "var(--radius)";
    errorDiv.style.marginBottom = "1rem";
    errorDiv.textContent = message;

    // Insert at the top of the main content
    const mainContent = document.querySelector("main");
    if (mainContent && mainContent.firstChild) {
      mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.style.opacity = "0";
      errorDiv.style.transition = "opacity 0.5s ease";

      setTimeout(() => {
        errorDiv.remove();
      }, 500);
    }, 5000);
  }
}
