const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskContainer = document.getElementById("taskContainer");
const themeBtn = document.getElementById("themeBtn");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const clearAllBtn = document.getElementById("clearAllBtn");
const attributeBtn = document.getElementById("attributeBtn");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");

const removedDefaultTask = {
    id: "1781626389533",
    title: "Default Task",
    category: "Study",
    status: "pending"
};

let taskId = 1;

function updateCounters() {

    const tasks =
        document.querySelectorAll(".task-card");

    const completed =
        document.querySelectorAll(".task-card.completed");

    totalCount.textContent =
        tasks.length;

    completedCount.textContent =
        completed.length;

    pendingCount.textContent =
        tasks.length - completed.length;
}

addTaskBtn.addEventListener("click", () => {

    const title =
        taskInput.value.trim();

    if (!title) return;

    const card =
        document.createElement("div");

    card.className =
        "task-card";

    card.setAttribute(
        "data-id",
        taskId++
    );

    card.setAttribute(
        "data-status",
        "pending"
    );

    card.setAttribute(
        "data-category",
        category.value
    );

    const titleNode =
        document.createTextNode(title);

    const heading =
        document.createElement("h3");

    heading.appendChild(titleNode);

    const categoryText =
        document.createElement("p");

    categoryText.textContent =
        "Category: " + category.value;

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";

    actions.innerHTML = `
        <button class="complete-btn">
            Complete
        </button>

        <button class="edit-btn">
            Edit
        </button>

        <button class="delete-btn">
            Delete
        </button>
    `;

    card.append(
        heading,
        categoryText,
        actions
    );

    const fragment =
        document.createDocumentFragment();

    fragment.appendChild(card);

    taskContainer.prepend(fragment);

    taskInput.value = "";

    updateCounters();

    saveTasks();
});

taskContainer.addEventListener("click", (e) => {

    const card =
        e.target.closest(".task-card");

    if (!card) return;

    if (
        e.target.classList.contains(
            "delete-btn"
        )
    ) {

        card.remove();

        updateCounters();

        saveTasks();
    }

    if (
        e.target.classList.contains(
            "complete-btn"
        )
    ) {

        card.classList.toggle(
            "completed"
        );

        card.dataset.status =
            card.classList.contains(
                "completed"
            )
                ? "completed"
                : "pending";

        updateCounters();

        saveTasks();
    }

    if (
        e.target.classList.contains(
            "edit-btn"
        )
    ) {

        const title =
            prompt(
                "Edit Task",
                card.querySelector("h3")
                    .textContent
            );

        if (title) {

            const newHeading =
                document.createElement("h3");

            newHeading.textContent =
                title;

            card
                .querySelector("h3")
                .replaceWith(
                    newHeading
                );

            saveTasks();
        }
    }
});

themeBtn.addEventListener("click", () => {

    const current =
        document.body.dataset.theme;

    if (current === "light") {

        document.body.dataset.theme =
            "dark";

        document.body.classList.add(
            "dark"
        );

        document.body.setAttribute(
            "data-theme",
            "dark"
        );

        themeBtn.textContent =
            "Light Mode";

    } else {

        document.body.dataset.theme =
            "light";

        document.body.classList.remove(
            "dark"
        );

        document.body.setAttribute(
            "data-theme",
            "light"
        );

        themeBtn.textContent =
            "Dark Mode";
    }
});

attributeBtn.addEventListener("click", () => {

    console.log(
        "Property Value:",
        taskInput.value
    );

    console.log(
        "Attribute Value:",
        taskInput.getAttribute(
            "value"
        )
    );

    alert(
        "Check Console for Property vs Attribute Demo"
    );
});

searchInput.addEventListener("input", filterTasks);

filterCategory.addEventListener(
    "change",
    filterTasks
);

function filterTasks() {

    const search =
        searchInput.value
            .toLowerCase();

    const filter =
        filterCategory.value;

    document
        .querySelectorAll(".task-card")
        .forEach(card => {

            const title =
                card.querySelector("h3")
                    .textContent
                    .toLowerCase();

            const category =
                card.dataset.category;

            const matchesSearch =
                title.includes(search);

            const matchesCategory =
                filter === "All" ||
                category === filter;

            card.style.display =
                matchesSearch &&
                    matchesCategory
                    ? "block"
                    : "none";
        });
}

clearAllBtn.addEventListener(
    "click",
    () => {

        taskContainer.innerHTML = "";

        updateCounters();

        saveTasks();
    }
);

function saveTasks() {

    localStorage.setItem(
        "tasks",
        taskContainer.innerHTML
    );
}

function loadTasks() {

    const data =
        localStorage.getItem(
            "tasks"
        );

    if (data) {

        taskContainer.innerHTML =
            data;

        const task =
            Array.from(
                taskContainer.querySelectorAll(
                    ".task-card"
                )
            ).find(card =>
                card.dataset.id ===
                    removedDefaultTask.id &&
                card.querySelector("h3")?.textContent ===
                    removedDefaultTask.title &&
                card.dataset.category ===
                    removedDefaultTask.category &&
                card.dataset.status ===
                    removedDefaultTask.status
            );

        if (task) {
            task.remove();
            saveTasks();
        }

        updateCounters();
    }
}

loadTasks();

const grandparent =
    document.getElementById(
        "grandparent"
    );

const parent =
    document.getElementById(
        "parent"
    );

const child =
    document.getElementById(
        "childBtn"
    );

grandparent.addEventListener(
    "click",
    () =>
        console.log(
            "Bubbling Grandparent"
        )
);

parent.addEventListener(
    "click",
    () =>
        console.log(
            "Bubbling Parent"
        )
);

child.addEventListener(
    "click",
    () =>
        console.log(
            "Bubbling Child"
        )
);

grandparent.addEventListener(
    "click",
    () =>
        console.log(
            "Capturing Grandparent"
        ),
    true
);

parent.addEventListener(
    "click",
    () =>
        console.log(
            "Capturing Parent"
        ),
    true
);

child.addEventListener(
    "click",
    () =>
        console.log(
            "Capturing Child"
        ),
    true
);