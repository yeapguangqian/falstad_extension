// inject.js
window.addEventListener("message", (event) => {
    if (event.data.type === "ACTIVATE_TOOL") {
        // We use a try/catch because if the menu hasn't loaded yet, it might error
        try {
            if (window.sim) {
                // This tells Falstad to select the subcircuit as the active drawing tool
                window.sim.getMenu().getItemByID("subcircuit:" + event.data.name).click();
            }
        } catch (e) {
            console.error("Falstad Manager: Failed to activate tool", e);
            // Fallback: If the menu click fails, we alert the user
            alert("Subcircuit loaded! Find it in: Right Click -> Subcircuits");
        }
    }
});