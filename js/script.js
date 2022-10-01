document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("form");
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = "render-book";

const searchBar = document.getElementById('searchBookTitle');

searchBar.addEventListener('input', function (e) {
    const searchString = e.target.value.toLowerCase();

    const uncompletedREADList = document.getElementById('books');
    uncompletedREADList.innerHTML = '';

    const completedREADList = document.getElementById('completed-books');
    completedREADList.innerHTML = '';

    for (const bookItem of books) {
        const item = findBook(bookItem.id);
        const bookElement = makeBook(item);
        if (item.title.toLowerCase().includes(searchString)) {
            if (!bookItem.isCompleted) {
                uncompletedREADList.append(bookElement);
            } else {
                completedREADList.append(bookElement);
            }
        }
    }
});

function addBook() {
    const titleBar = document.getElementById("title").value;
    const writerBar = document.getElementById("writer").value;
    const yearBar = document.getElementById("year").value;

    const generatedID = generateId();

    const checkedComplete = document.getElementById("isBookComplete");
    if (checkedComplete.checked == true) {
        const bookObject = generateBookObject(
            generatedID,
            titleBar,
            writerBar,
            yearBar,
            true
        );
        books.push(bookObject);
    } else {
        const bookObject = generateBookObject(
            generatedID,
            titleBar,
            writerBar,
            yearBar,
            false
        );
        books.push(bookObject);
    }


    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, writer, year, isCompleted) {
    return {
        id,
        title,
        writer,
        year,
        isCompleted
    };
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedREADList = document.getElementById('books');
    uncompletedREADList.innerHTML = '';

    const completedREADList = document.getElementById('completed-books');
    completedREADList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            uncompletedREADList.append(bookElement);
        else
            completedREADList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement("h2");
    textTitle.innerText = bookObject.title;

    const textWriter = document.createElement("p");
    textWriter.innerText = "Penulis: " + bookObject.writer;

    const textYear = document.createElement("p");
    textYear.innerText = "Tahun: " + bookObject.year;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(textTitle, textWriter, textYear);

    const container = document.createElement("div");
    container.classList.add("item", "shadow");
    container.append(textContainer);
    container.setAttribute("id", `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement("button");
        undoButton.classList.add("btn-undo");
        undoButton.innerText = "Belum selesai";

        undoButton.addEventListener("click", function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("btn-delete");
        trashButton.innerText = "Hapus buku";

        trashButton.addEventListener("click", function () {
            onRemove(bookObject.id);
        });

        const listButton = document.createElement("div");
        listButton.classList.add("inner-Button");
        listButton.append(undoButton, trashButton);

        container.append(listButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("btn-done");
        checkButton.innerText = "Selesai";

        checkButton.addEventListener("click", function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("btn-delete");
        trashButton.innerText = "Hapus buku";

        trashButton.addEventListener("click", function () {
            onRemove(bookObject.id);
        });

        const listButton = document.createElement("div");
        listButton.classList.add("inner-Button");
        listButton.append(checkButton, trashButton);

        container.append(listButton);
    }

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function onRemove(bookId) {
    const makeSure = document.getElementById("features");

    const background = document.createElement("div");
    background.classList.add("background");

    const message = document.createElement("div");
    message.classList.add("message");

    const titleRemove = document.createElement("h3");
    titleRemove.innerHTML = "Yakin ingin menghapus buku <br>'" + findBook(bookId).title + "'?";

    const buttonsRemove = document.createElement("div");
    buttonsRemove.style.marginLeft = "20%";

    const tr = document.createElement("tr");
    tr.innerHTML = '<td><button id="removeBook" class="btn">Ya</button></td>';
    tr.innerHTML += '<td><button id="noRemoveBook" class="btn">Tidak</button></td>';

    buttonsRemove.append(tr);
    message.append(titleRemove, buttonsRemove);
    makeSure.append(background, message);

    makeSure.style.visibility = "visible";

    const removeBook = document.getElementById("removeBook");
    removeBook.addEventListener("click", function () {
        removeBookFromCompleted(bookId);
        makeSure.style.visibility = "hidden";
        background.remove();
        message.remove();
    });

    const noRemoveBook = document.getElementById("noRemoveBook");
    noRemoveBook.addEventListener("click", function () {
        makeSure.style.visibility = "hidden";
        background.remove();
        message.remove();
    });
}