var ThemeManager;
(function (ThemeManager) {
    document.addEventListener("DOMContentLoaded", () => {
        const themeToggle = document.getElementById("theme-toggle");
        const sunIcon = document.getElementById("sun-icon");
        const moonIcon = document.getElementById("moon-icon");
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add("dark");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        }
        // Toggle theme
        themeToggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            // Update icons
            if (document.documentElement.classList.contains("dark")) {
                sunIcon.style.display = "none";
                moonIcon.style.display = "block";
                localStorage.setItem("theme", "dark");
            }
            else {
                sunIcon.style.display = "block";
                moonIcon.style.display = "none";
                localStorage.setItem("theme", "light");
            }
        });
    });
})(ThemeManager || (ThemeManager = {}));
