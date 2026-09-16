let applicants = [];
let selectors = [];

function addApplicant() {
  const name = document.getElementById("applicantName").value.trim();
  const prefs = document.getElementById("applicantPrefs").value.trim();

  if (!name || !prefs) {
    alert("Please fill in both name and preferences.");
    return;
  }

  applicants.push({
    name: name,
    preferences: prefs.split(",").map(p => p.trim())
  });

  document.getElementById("applicantName").value = "";
  document.getElementById("applicantPrefs").value = "";

  renderLists();
}

function addSelector() {
  const name = document.getElementById("selectorName").value.trim();
  const prefs = document.getElementById("selectorPrefs").value.trim();
  const capacity = parseInt(document.getElementById("selectorCapacity").value) || 1;

  if (!name || !prefs) {
    alert("Please fill in both name and preferences.");
    return;
  }

  selectors.push({
    name: name,
    preferences: prefs.split(",").map(p => p.trim()),
    capacity: capacity
  });

  document.getElementById("selectorName").value = "";
  document.getElementById("selectorPrefs").value = "";
  document.getElementById("selectorCapacity").value = "1";

  renderLists();
}

function renderLists() {
  const applicantList = document.getElementById("applicantList");
  applicantList.innerHTML = "";
  applicants.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `${a.name} — prefers: ${a.preferences.join(", ")}`;
    applicantList.appendChild(li);
  });

  const selectorList = document.getElementById("selectorList");
  selectorList.innerHTML = "";
  selectors.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (capacity: ${s.capacity}) — prefers: ${s.preferences.join(", ")}`;
    selectorList.appendChild(li);
  });
}
function runMatching() {
  // Reset state
  let freeApplicants = applicants.map(a => ({ ...a, nextIndex: 0 }));
  let matches = {}; // selectorName -> array of applicant names currently held

  selectors.forEach(s => {
    matches[s.name] = [];
  });

  while (freeApplicants.length > 0) {
    const applicant = freeApplicants.shift();

    if (applicant.nextIndex >= applicant.preferences.length) {
      continue; // this applicant has no more choices left
    }

    const choice = applicant.preferences[applicant.nextIndex];
    applicant.nextIndex++;

    const selector = selectors.find(s => s.name === choice);
    if (!selector) {
      freeApplicants.push(applicant); // invalid choice, try next
      continue;
    }

    matches[choice].push(applicant.name);

    // If over capacity, drop the selector's least-preferred applicant
    if (matches[choice].length > selector.capacity) {
  matches[choice].sort((a, b) => {
    let rankA = selector.preferences.indexOf(a);
    let rankB = selector.preferences.indexOf(b);
    if (rankA === -1) rankA = Infinity; // not preferred at all → goes last
    if (rankB === -1) rankB = Infinity;
    return rankA - rankB;
  });
      const rejected = matches[choice].pop(); // worst-ranked one
      const rejectedApplicant = applicants.find(a => a.name === rejected);
      freeApplicants.push({ ...rejectedApplicant, nextIndex: 
        (applicant.name === rejected ? applicant.nextIndex : 
        freeApplicants.find(f => f.name === rejected)?.nextIndex || 0) });
    }
  }

  displayResults(matches);
}

function displayResults(matches) {
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";

  Object.keys(matches).forEach(selectorName => {
    const applicantNames = matches[selectorName];
    const li = document.createElement("li");
    li.textContent = applicantNames.length > 0
      ? `${selectorName} matched with: ${applicantNames.join(", ")}`
      : `${selectorName} matched with: (no one)`;
    resultsList.appendChild(li);
  });
}