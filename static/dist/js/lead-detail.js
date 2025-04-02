var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var LeadDetailPage;
(function (LeadDetailPage) {
    let currentLeadId;
    document.addEventListener("DOMContentLoaded", () => {
        // Extract lead ID from URL
        const pathParts = window.location.pathname.split("/");
        currentLeadId = parseInt(pathParts[pathParts.length - 1]);
        if (isNaN(currentLeadId)) {
            console.error("Invalid lead ID");
            return;
        }
        fetchLeadDetails(currentLeadId);
        setupEventListeners();
    });
    function fetchLeadDetails(leadId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/leads/${leadId}`);
                const lead = yield response.json();
                displayLeadDetails(lead);
                displayNotes(lead.notes || []);
            }
            catch (error) {
                console.error("Error fetching lead details:", error);
            }
        });
    }
    function displayLeadDetails(lead) {
        document.getElementById("lead-name").textContent = lead.name;
        document.getElementById("detail-name").textContent = lead.name;
        document.getElementById("detail-email").textContent = lead.email || "-";
        document.getElementById("detail-phone").textContent = lead.phone || "-";
        document.getElementById("detail-company").textContent =
            lead.company || "-";
        const statusElement = document.getElementById("detail-status");
        statusElement.textContent = lead.status;
        statusElement.className = `info-value status-badge status-${lead.status}`;
        const date = new Date(lead.created_at);
        document.getElementById("detail-created").textContent =
            date.toLocaleString();
    }
    function displayNotes(notes) {
        const notesContainer = document.getElementById("notes-container");
        notesContainer.innerHTML = "";
        if (notes.length === 0) {
            notesContainer.innerHTML =
                '<p class="no-notes">No notes yet. Add a note to keep track of your interactions.</p>';
            return;
        }
        notes.forEach((note) => {
            const noteElement = document.createElement("div");
            noteElement.className = "note-item";
            const date = new Date(note.created_at);
            const formattedDate = date.toLocaleString();
            noteElement.innerHTML = `
          <div class="note-meta">
            ${formattedDate}
            <div class="note-actions">
              <button class="edit-note-btn" data-id="${note.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="delete-note-btn" data-id="${note.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="note-content">
            ${note.content}
          </div>
        `;
            notesContainer.appendChild(noteElement);
        });
        // Add event listeners to edit and delete buttons
        document.querySelectorAll(".edit-note-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const noteId = e.currentTarget.getAttribute("data-id");
                openEditNoteModal(parseInt(noteId));
            });
        });
        document.querySelectorAll(".delete-note-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const noteId = e.currentTarget.getAttribute("data-id");
                deleteNote(parseInt(noteId));
            });
        });
    }
    // Add these new functions
    function openEditNoteModal(noteId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/leads/${currentLeadId}`);
                const lead = yield response.json();
                const note = lead.notes.find((n) => n.id === noteId);
                if (!note)
                    throw new Error("Note not found");
                document.getElementById("edit-note-id").value =
                    noteId.toString();
                document.getElementById("edit-note-content").value = note.content;
                const modal = document.getElementById("edit-note-modal");
                modal.style.display = "block";
            }
            catch (error) {
                console.error("Error fetching note details:", error);
            }
        });
    }
    function deleteNote(noteId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!confirm("Are you sure you want to delete this note?"))
                return;
            try {
                yield fetch(`/api/notes/${noteId}`, {
                    method: "DELETE",
                });
                fetchLeadDetails(currentLeadId);
            }
            catch (error) {
                console.error("Error deleting note:", error);
            }
        });
    }
    function setupEventListeners() {
        const modal = document.getElementById("lead-modal");
        const editLeadBtn = document.getElementById("edit-lead-btn");
        const closeBtn = document.getElementById("close-lead-modal");
        const leadForm = document.getElementById("lead-form");
        const deleteLeadBtn = document.getElementById("delete-lead-btn");
        const addNoteBtn = document.getElementById("add-note-btn");
        const noteFormContainer = document.getElementById("note-form-container");
        const cancelNoteBtn = document.getElementById("cancel-note-btn");
        const noteForm = document.getElementById("note-form");
        // Edit note modal elements
        const editNoteModal = document.getElementById("edit-note-modal");
        const closeEditNoteBtn = document.querySelector(".close-note-modal");
        const editNoteForm = document.getElementById("edit-note-form");
        // Edit lead button
        editLeadBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/api/leads/${currentLeadId}`);
                const lead = yield response.json();
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
                modal.style.display = "block";
            }
            catch (error) {
                console.error("Error fetching lead details:", error);
            }
        }));
        deleteLeadBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
                return;
            }
            try {
                yield fetch(`/api/leads/${currentLeadId}`, {
                    method: "DELETE",
                });
                modal.style.display = "none";
                // Redirect to leads page after deletion
                window.location.href = "/leads";
            }
            catch (error) {
                console.error("Error deleting lead:", error);
            }
        }));
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
        // Handle lead form submission
        leadForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
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
                yield fetch(`/api/leads/${currentLeadId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(leadData),
                });
                modal.style.display = "none";
                fetchLeadDetails(currentLeadId);
            }
            catch (error) {
                console.error("Error updating lead:", error);
            }
        }));
        // Add note button
        addNoteBtn.addEventListener("click", () => {
            noteFormContainer.classList.remove("hidden");
        });
        // Handle note form submission
        noteForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const content = document.getElementById("note-content").value;
            try {
                yield fetch(`/api/leads/${currentLeadId}/notes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                });
                noteFormContainer.classList.add("hidden");
                noteForm.reset();
                fetchLeadDetails(currentLeadId);
            }
            catch (error) {
                console.error("Error adding note:", error);
            }
        }));
        window.addEventListener("click", (e) => {
            if (e.target === editNoteModal) {
                editNoteModal.style.display = "none";
            }
        });
        editNoteForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const noteId = document.getElementById("edit-note-id").value;
            const content = document.getElementById("edit-note-content").value;
            try {
                yield fetch(`/api/notes/${noteId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                });
                editNoteModal.style.display = "none";
                fetchLeadDetails(currentLeadId);
            }
            catch (error) {
                console.error("Error updating note:", error);
            }
        }));
    }
})(LeadDetailPage || (LeadDetailPage = {}));
