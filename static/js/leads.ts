namespace LeadsPage {
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
    fetchLeads();
    setupEventListeners();
  });

  async function fetchLeads() {
    try {
      const response = await fetch("/api/leads");
      const leads: Lead[] = await response.json();
      displayLeads(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }

  function displayLeads(leads: Lead[]) {
    const tableBody = document.getElementById("leads-table-body")!;
    tableBody.innerHTML = "";

    if (leads.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align: center;">No leads found</td>`;
      tableBody.appendChild(row);
      return;
    }

    leads.forEach((lead) => {
      const row = document.createElement("tr");

      const date = new Date(lead.created_at);
      const formattedDate = date.toLocaleDateString();

      row.innerHTML = `
            <td><a href="/lead/${lead.id}">${lead.name}</a></td>
            <td>${lead.email || "-"}</td>
            <td>${lead.phone || "-"}</td>
            <td>${lead.company || "-"}</td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="button edit-lead" data-id="${lead.id}">Edit</button>
            </td>
        `;

      tableBody.appendChild(row);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-lead").forEach((button) => {
      button.addEventListener("click", (e) => {
        const leadId = (e.currentTarget as HTMLElement).getAttribute("data-id");
        openEditLeadModal(parseInt(leadId!));
      });
    });
  }

  function setupEventListeners() {
    const modal = document.getElementById("lead-modal") as HTMLElement;
    const addLeadBtn = document.getElementById("add-lead-btn") as HTMLElement;
    const closeBtn = document.querySelector(".close") as HTMLElement;
    const leadForm = document.getElementById("lead-form") as HTMLFormElement;
    const deleteLeadBtn = document.getElementById(
      "delete-lead-btn",
    ) as HTMLElement;

    const statusFilter = document.getElementById(
      "status-filter",
    ) as HTMLSelectElement;
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;

    deleteLeadBtn.addEventListener("click", async () => {
      const leadId = (document.getElementById("lead-id") as HTMLInputElement)
        .value;

      if (!leadId) return;

      if (
        !confirm(
          "Are you sure you want to delete this lead? This action cannot be undone.",
        )
      ) {
        return;
      }

      try {
        await fetch(`/api/leads/${leadId}`, {
          method: "DELETE",
        });

        modal.style.display = "none";
        fetchLeads();
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    });

    // Open modal for adding a new lead
    addLeadBtn.addEventListener("click", () => {
      document.getElementById("modal-title")!.textContent = "Add New Lead";
      leadForm.reset();
      (document.getElementById("lead-id") as HTMLInputElement).value = "";
      modal.style.display = "block";
    });

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Handle form submission
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const leadId = (document.getElementById("lead-id") as HTMLInputElement)
        .value;
      const name = (document.getElementById("name") as HTMLInputElement).value;
      const email = (document.getElementById("email") as HTMLInputElement)
        .value;
      const phone = (document.getElementById("phone") as HTMLInputElement)
        .value;
      const company = (document.getElementById("company") as HTMLInputElement)
        .value;
      const status = (document.getElementById("status") as HTMLSelectElement)
        .value;

      const leadData = {
        name,
        email,
        phone,
        company,
        status,
      };

      try {
        if (leadId) {
          // Update existing lead
          await fetch(`/api/leads/${leadId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(leadData),
          });
        } else {
          // Create new lead
          await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(leadData),
          });
        }

        modal.style.display = "none";
        fetchLeads();
      } catch (error) {
        console.error("Error saving lead:", error);
      }
    });

    // Filter leads by status
    statusFilter.addEventListener("change", async () => {
      const status = statusFilter.value;
      const searchTerm = searchInput.value.toLowerCase();

      try {
        const response = await fetch("/api/leads");
        let leads: Lead[] = await response.json();

        // Apply status filter
        if (status !== "all") {
          leads = leads.filter((lead) => lead.status === status);
        }

        // Apply search filter
        if (searchTerm) {
          leads = leads.filter(
            (lead) =>
              lead.name.toLowerCase().includes(searchTerm) ||
              (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
              (lead.company && lead.company.toLowerCase().includes(searchTerm)),
          );
        }

        displayLeads(leads);
      } catch (error) {
        console.error("Error filtering leads:", error);
      }
    });

    // Search leads
    searchInput.addEventListener("input", async () => {
      const status = statusFilter.value;
      const searchTerm = searchInput.value.toLowerCase();

      try {
        const response = await fetch("/api/leads");
        let leads: Lead[] = await response.json();

        // Apply status filter
        if (status !== "all") {
          leads = leads.filter((lead) => lead.status === status);
        }

        // Apply search filter
        if (searchTerm) {
          leads = leads.filter(
            (lead) =>
              lead.name.toLowerCase().includes(searchTerm) ||
              (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
              (lead.company && lead.company.toLowerCase().includes(searchTerm)),
          );
        }

        displayLeads(leads);
      } catch (error) {
        console.error("Error searching leads:", error);
      }
    });
  }

  async function openEditLeadModal(leadId: number) {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      const lead = await response.json();

      document.getElementById("modal-title")!.textContent = "Edit Lead";
      (document.getElementById("lead-id") as HTMLInputElement).value =
        lead.id.toString();
      (document.getElementById("name") as HTMLInputElement).value = lead.name;
      (document.getElementById("email") as HTMLInputElement).value =
        lead.email || "";
      (document.getElementById("phone") as HTMLInputElement).value =
        lead.phone || "";
      (document.getElementById("company") as HTMLInputElement).value =
        lead.company || "";
      (document.getElementById("status") as HTMLSelectElement).value =
        lead.status;

      const modal = document.getElementById("lead-modal") as HTMLElement;
      modal.style.display = "block";
    } catch (error) {
      console.error("Error fetching lead details:", error);
    }
  }
}
