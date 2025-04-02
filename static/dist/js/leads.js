var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var LeadsPage;
(function (LeadsPage) {
    document.addEventListener("DOMContentLoaded", () => {
        fetchLeads();
        setupEventListeners();
    });
    function fetchLeads() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("/api/leads");
                const leads = yield response.json();
                displayLeads(leads);
            }
            catch (error) {
                console.error("Error fetching leads:", error);
            }
        });
    }
    function displayLeads(leads) {
        const tableBody = document.getElementById("leads-table-body");
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
                const leadId = e.currentTarget.getAttribute("data-id");
                openEditLeadModal(parseInt(leadId));
            });
        });
    }
    function setupEventListeners() {
        const modal = document.getElementById("lead-modal");
        const addLeadBtn = document.getElementById("add-lead-btn");
        const closeBtn = document.querySelector(".close");
        const leadForm = document.getElementById("lead-form");
        const deleteLeadBtn = document.getElementById("delete-lead-btn");
        const statusFilter = document.getElementById("status-filter");
        const searchInput = document.getElementById("search-input");
        deleteLeadBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const leadId = document.getElementById("lead-id")
                .value;
            if (!leadId)
                return;
            if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
                return;
            }
            try {
                yield fetch(`/api/leads/${leadId}`, {
                    method: "DELETE",
                });
                modal.style.display = "none";
                fetchLeads();
            }
            catch (error) {
                console.error("Error deleting lead:", error);
            }
        }));
        // Open modal for adding a new lead
        addLeadBtn.addEventListener("click", () => {
            document.getElementById("modal-title").textContent = "Add New Lead";
            leadForm.reset();
            document.getElementById("lead-id").value = "";
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
        leadForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const leadId = document.getElementById("lead-id")
                .value;
            const name = document.getElementById("name").value;
            const email = document.getElementById("email")
                .value;
            const phone = document.getElementById("phone")
                .value;
            const company = document.getElementById("company")
                .value;
            const status = document.getElementById("status")
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
                    yield fetch(`/api/leads/${leadId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(leadData),
                    });
                }
                else {
                    // Create new lead
                    yield fetch("/api/leads", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(leadData),
                    });
                }
                modal.style.display = "none";
                fetchLeads();
            }
            catch (error) {
                console.error("Error saving lead:", error);
            }
        }));
        // Filter leads by status
        statusFilter.addEventListener("change", () => __awaiter(this, void 0, void 0, function* () {
            const status = statusFilter.value;
            const searchTerm = searchInput.value.toLowerCase();
            try {
                const response = yield fetch("/api/leads");
                let leads = yield response.json();
                // Apply status filter
                if (status !== "all") {
                    leads = leads.filter((lead) => lead.status === status);
                }
                // Apply search filter
                if (searchTerm) {
                    leads = leads.filter((lead) => lead.name.toLowerCase().includes(searchTerm) ||
                        (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
                        (lead.company && lead.company.toLowerCase().includes(searchTerm)));
                }
                displayLeads(leads);
            }
            catch (error) {
                console.error("Error filtering leads:", error);
            }
        }));
        // Search leads
        searchInput.addEventListener("input", () => __awaiter(this, void 0, void 0, function* () {
            const status = statusFilter.value;
            const searchTerm = searchInput.value.toLowerCase();
            try {
                const response = yield fetch("/api/leads");
                let leads = yield response.json();
                // Apply status filter
                if (status !== "all") {
                    leads = leads.filter((lead) => lead.status === status);
                }
                // Apply search filter
                if (searchTerm) {
                    leads = leads.filter((lead) => lead.name.toLowerCase().includes(searchTerm) ||
                        (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
                        (lead.company && lead.company.toLowerCase().includes(searchTerm)));
                }
                displayLeads(leads);
            }
            catch (error) {
                console.error("Error searching leads:", error);
            }
        }));
    }
    function openEditLeadModal(leadId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/leads/${leadId}`);
                const lead = yield response.json();
                document.getElementById("modal-title").textContent = "Edit Lead";
                document.getElementById("lead-id").value =
                    lead.id.toString();
                document.getElementById("name").value = lead.name;
                document.getElementById("email").value =
                    lead.email || "";
                document.getElementById("phone").value =
                    lead.phone || "";
                document.getElementById("company").value =
                    lead.company || "";
                document.getElementById("status").value =
                    lead.status;
                const modal = document.getElementById("lead-modal");
                modal.style.display = "block";
            }
            catch (error) {
                console.error("Error fetching lead details:", error);
            }
        });
    }
})(LeadsPage || (LeadsPage = {}));
