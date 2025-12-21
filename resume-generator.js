// Logic for Resume Generator
// Dependencies: jspdf, resume-data.js

window.onload = function () {
    console.log("Resume Generator Loaded");

    if (!window.jspdf) {
        console.error("jsPDF library not loaded - window.jspdf is undefined");
        return;
    }

    const { jsPDF } = window.jspdf;
    console.log("jsPDF object:", jsPDF);

    // 1. Hook up the "Download Resume" button in Hero
    const downloadBtn = document.getElementById('download-resume-btn');
    const modal = document.getElementById('resume-modal');
    const closeBtn = modal.querySelector('.close-resume-modal');
    const skillContainer = document.getElementById('skill-checkboxes');
    const btnGeneric = document.getElementById('btn-download-generic');
    const btnAnalyze = document.getElementById('btn-analyze-resume');
    const jdInput = document.getElementById('job-description-input');
    const skillSelectorContainer = document.getElementById('skill-selector-container');

    // Prevent default download and show modal
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            populateSkillCheckboxes();
            skillSelectorContainer.style.display = 'block'; // Always show manual selection
            modal.style.display = 'flex';
        });
    }

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        jdInput.value = ''; // Reset
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Button Actions
    btnGeneric.addEventListener('click', () => {
        generatePDF(RESUME_DATA); // Generate with all data
        modal.style.display = 'none';
    });

    btnAnalyze.addEventListener('click', () => {
        const jdText = jdInput.value.toLowerCase();
        const selectedSkills = getSelectedSkills();

        // Optimize Data
        const optimizedData = optimizeResumeData(RESUME_DATA, jdText, selectedSkills);
        generatePDF(optimizedData);
        modal.style.display = 'none';
    });

    // Helpers
    function populateSkillCheckboxes() {
        skillContainer.innerHTML = '';
        const allSkills = [
            ...RESUME_DATA.skills.Technical,
            ...RESUME_DATA.skills.Advanced,
            ...RESUME_DATA.skills.Languages,
            ...RESUME_DATA.skills.Design
        ];

        allSkills.forEach(skill => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '8px';
            label.style.padding = '4px 8px';
            label.style.background = 'rgba(255,255,255,0.05)';
            label.style.borderRadius = '4px';
            label.style.cursor = 'pointer';
            label.style.fontSize = '0.85rem';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = skill;
            checkbox.checked = true; // Default all selected

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(skill));
            skillContainer.appendChild(label);
        });
    }

    function getSelectedSkills() {
        const checkboxes = skillContainer.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function optimizeResumeData(data, jdText, selectedSkills) {
        // 1. Filter skills based on user selection
        // We flatten the categories for the custom resume to a simple "Skills" list or keep categories but filtered
        let filteredSkills = {};

        // Helper to check if a skill is selected
        const isSelected = (s) => selectedSkills.includes(s);

        for (const category in data.skills) {
            filteredSkills[category] = data.skills[category].filter(isSelected);
        }

        // 2. Keyword Matching & Scoring (Simple)
        // Check if JD contains skill keywords, prioritize them
        // For projects: if JD words match project desc/tech, move project up

        let prioritizedProjects = [...data.projects];
        if (jdText.length > 10) {
            const keywords = jdText.split(/\W+/).filter(w => w.length > 3);

            prioritizedProjects.sort((a, b) => {
                const scoreA = calculateRelevance(a, keywords);
                const scoreB = calculateRelevance(b, keywords);
                return scoreB - scoreA; // Descending
            });
        }

        return {
            ...data,
            skills: filteredSkills,
            projects: prioritizedProjects
        };
    }

    function calculateRelevance(project, keywords) {
        let score = 0;
        const text = (project.title + " " + project.tech + " " + project.description).toLowerCase();
        keywords.forEach(word => {
            if (text.includes(word)) score += 1;
        });
        return score;
    }

    // PDF GENERATION
    function generatePDF(data) {
        const doc = new jsPDF();
        let yPos = 20;
        const margin = 20;
        const contentWidth = 170; // 210 - 2*20

        // Helpers
        function checkPageBreak(height) {
            if (yPos + height > 280) {
                doc.addPage();
                yPos = 20;
            }
        }

        function sectionTitle(title) {
            checkPageBreak(15);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(title.toUpperCase(), margin, yPos);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
            yPos += 10;
        }

        // --- Header ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(data.personal.name, margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(data.personal.title, margin, yPos);
        yPos += 6;

        const contactLine = `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`;
        doc.text(contactLine, margin, yPos);
        yPos += 6;

        const linksLine = `${data.personal.linkedin} | ${data.personal.github}`;
        doc.setTextColor(0, 0, 255); // Blue links
        doc.text(linksLine, margin, yPos);
        doc.setTextColor(0, 0, 0); // Reset
        yPos += 12;

        // --- Summary ---
        if (data.personal.summary) {
            sectionTitle("Professional Summary");
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitSummary = doc.splitTextToSize(data.personal.summary, contentWidth);
            checkPageBreak(splitSummary.length * 5);
            doc.text(splitSummary, margin, yPos);
            yPos += splitSummary.length * 5 + 5;
        }

        // --- Skills ---
        // Flatten for clean display or grouped? Grouped is better.
        sectionTitle("Technical Skills");
        doc.setFontSize(10);

        for (const [category, skills] of Object.entries(data.skills)) {
            if (skills.length === 0) continue;

            const catTitle = `${category}:`;
            doc.setFont('helvetica', 'bold');
            doc.text(catTitle, margin, yPos);

            const skillList = skills.join(", ");
            doc.setFont('helvetica', 'normal');

            // Indent skills
            const splitSkills = doc.splitTextToSize(skillList, contentWidth - 30);
            checkPageBreak(splitSkills.length * 5);
            doc.text(splitSkills, margin + 30, yPos);
            yPos += splitSkills.length * 5 + 2;
        }
        yPos += 5;

        // --- Experience ---
        sectionTitle("Experience");
        data.experience.forEach(job => {
            checkPageBreak(25);

            // Title & Company
            doc.setFont('helvetica', 'bold');
            doc.text(job.role, margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(job.duration, margin + contentWidth, yPos, { align: 'right' });
            yPos += 5;

            doc.setFont('helvetica', 'italic');
            doc.text(`${job.company} - ${job.type}`, margin, yPos);
            yPos += 6;

            // Description
            doc.setFont('helvetica', 'normal');
            const splitDesc = doc.splitTextToSize(job.description, contentWidth);
            doc.text(splitDesc, margin, yPos);
            yPos += splitDesc.length * 5 + 6;
        });

        // --- Projects ---
        sectionTitle("Projects");
        data.projects.slice(0, 5).forEach(proj => { // Limit to top 5 relevant
            checkPageBreak(25);

            doc.setFont('helvetica', 'bold');
            doc.text(proj.title, margin, yPos);
            yPos += 5;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text(`Tech: ${proj.tech}`, margin, yPos);
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const splitDesc = doc.splitTextToSize(proj.description, contentWidth);
            doc.text(splitDesc, margin, yPos);
            yPos += splitDesc.length * 5 + 6;
        });

        // --- Education ---
        sectionTitle("Education");
        data.education.forEach(edu => {
            checkPageBreak(15);
            doc.setFont('helvetica', 'bold');
            doc.text(edu.degree, margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(edu.year, margin + contentWidth, yPos, { align: 'right' });
            yPos += 5;
            doc.text(edu.university, margin, yPos);
            yPos += 10;
        });

        // Output
        try {
            doc.save(`${data.personal.name.replace(/\s+/g, '_')}_Resume.pdf`);
            console.log("PDF generated and save requested.");
        } catch (err) {
            console.error("Error saving PDF:", err);
            alert("Error saving Resume PDF. Please check console.");
        }
    }
};
