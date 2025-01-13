document.addEventListener("DOMContentLoaded", () => {
    // Handle certificate verification
    const verifyForm = document.getElementById("verify-form");
    verifyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const certificateId = document.getElementById("certificateId").value;
        
        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ certificateId })
            });

            const result = await response.json();
            document.getElementById("verify-result").innerText = result.message || "Verification failed.";
        } catch (error) {
            document.getElementById("verify-result").innerText = "Error verifying certificate.";
        }
    });

    // Handle certificate upload
    const uploadForm = document.getElementById("upload-form");
    uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const certificateFile = document.getElementById("certificateFile").files[0];

        const formData = new FormData();
        formData.append("certificate", certificateFile);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            document.getElementById("upload-result").innerText = result.message || "Upload failed.";
        } catch (error) {
            document.getElementById("upload-result").innerText = "Error uploading certificate.";
        }
    });
});
