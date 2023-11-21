import axios, { AxiosResponse } from 'axios';

const wrapper = document.querySelector<HTMLDivElement>('.js-wrapper');

type Characters = {
    id: number,
    name: string,
    race: string,
    age: number,
    class: string,
    lore: string,
    timestamp?: number
}

const addImage = (race: string, characterId: number) => {
    const characterElement = document.querySelector(`[data-character-id="${characterId}"] .character-image`);

    if (!characterElement) {
        console.error(`Character element with ID ${characterId} not found.`);
        return;
    }

    const raceImageMap: Record<string, string> = {
        NightElf: 'assets/images/NightElf.png',
        Dwarf: 'assets/images/Dwarf.png',
        Human: 'assets/images/Human.png',
        Worgen: 'assets/images/Worgen.png',
        Draenei: 'assets/images/Draenei.png',
        Gnome: 'assets/images/Gnome.png',
    };

    if (raceImageMap.hasOwnProperty(race)) {
        const imageUrl = raceImageMap[race];
        characterElement.setAttribute('src', imageUrl);
    } else {
        console.error(`No image found for ${race}`);
    }
};

function formatTimestamp(timestamp: number) {
    const now = new Date();
    const timestampDate = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);

    const secondsDiff = Math.floor((now.getTime() - timestampDate.getTime()) / 1000);
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (secondsDiff < 60) {
        return `${secondsDiff} second${secondsDiff === 1 ? '' : 's'} ago`;
    } else if (minutesDiff < 60) {
        return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
    } else if (hoursDiff < 24) {
        return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
    } else {
        return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`;
    };
};

const showToast = (message: string) => {
    // @ts-ignore
    window.Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, yellow, purple)",
            color: "#000",
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

const drawCharacters = () => {
    const result = axios.get<Characters[]>('http://localhost:3004/characters');

    wrapper.innerHTML = '';

    result.then(({ data }) => {
        data.forEach((character) => {
            wrapper.innerHTML += `
            <div class="characters" data-character-id="${character.id}">
                <img class="character-image" src="" alt="Character Image">
                <h1 class="characters__name" contentEditable="false">${character.name}</h1>
                <h2 class="characters__race" contentEditable="false">${character.race}</h1>
                <h3 class="characters__age" contentEditable="false">${character.age}</h1>
                <h3 class="characters__class" contentEditable="false">${character.class}</h1>
                <h3 class="characters__lore" contentEditable="false">${character.lore}</h1>
                <button class="js-characters-delete characters__button" data-characters-id="${character.id}">delete</button>
                <button class="js-characters-edit characters__button" data-characters-id="${character.id}">edit</button>
                <button class="js-characters-save characters__button" data-characters-id="${character.id}" style="display:none;">save</button>
                <br>
                <span class="timestamp">${formatTimestamp(character.timestamp || 0)}</span>
            </div>
            `;
            addImage(character.race, character.id);
        });
        const charactersDelete = document.querySelectorAll<HTMLButtonElement>('.js-characters-delete');
        const charactersEdit = document.querySelectorAll<HTMLButtonElement>('.js-characters-edit');
        const charactersSave = document.querySelectorAll<HTMLButtonElement>('.js-characters-save');

        charactersDelete.forEach((charactersBtn: HTMLButtonElement, index) => {
            charactersBtn.addEventListener('click', () => {
                const charactersID = charactersBtn.dataset.charactersId;
                axios.delete(`http://localhost:3004/characters/${charactersID}`).then(() => {
                    drawCharacters();
                    showToast('Character has been removed');
                });
            });
        });

        charactersEdit.forEach((charactersBtnEdit: HTMLButtonElement, index) => {
            charactersBtnEdit.addEventListener('click', () => {
                const nameElement = document.querySelectorAll<HTMLHeadingElement>('.characters__name')[index];
                const raceElement = document.querySelectorAll<HTMLHeadingElement>('.characters__race')[index];
                const ageElement = document.querySelectorAll<HTMLHeadingElement>('.characters__age')[index];
                const classElement = document.querySelectorAll<HTMLHeadingElement>('.characters__class')[index];
                const loreElement = document.querySelectorAll<HTMLHeadingElement>('.characters__lore')[index];

                const originalTimestamp = data[index].timestamp;

                nameElement.contentEditable = 'true';
                nameElement.style.border = '1px solid blue';
                raceElement.contentEditable = 'true';
                raceElement.style.border = '1px solid blue';
                ageElement.contentEditable = 'true';
                ageElement.style.border = '1px solid blue';
                classElement.contentEditable = 'true';
                classElement.style.border = '1px solid blue';
                loreElement.contentEditable = 'true';
                loreElement.style.border = '1px solid blue';

                charactersEdit[index].style.display = 'none';
                charactersSave[index].style.display = 'inline';

            });
        });

        charactersSave.forEach((charactersBtnSave: HTMLButtonElement, index) => {
            charactersBtnSave.addEventListener('click', () => {
                const nameElement = document.querySelectorAll<HTMLHeadingElement>('.characters__name')[index];
                const raceElement = document.querySelectorAll<HTMLHeadingElement>('.characters__race')[index];
                const ageElement = document.querySelectorAll<HTMLHeadingElement>('.characters__age')[index];
                const classElement = document.querySelectorAll<HTMLHeadingElement>('.characters__class')[index];
                const loreElement = document.querySelectorAll<HTMLHeadingElement>('.characters__lore')[index];
                const charactersID = charactersBtnSave.dataset.charactersId;

                axios.put(`http://localhost:3004/characters/${charactersID}`, { name: nameElement.innerText, race: raceElement.innerText, age: ageElement.innerText, class: classElement.innerText, lore: loreElement.innerText, timestamp: new Date() }).then(() => {
                    nameElement.contentEditable = 'false';
                    raceElement.contentEditable = 'false';
                    ageElement.contentEditable = 'false';
                    classElement.contentEditable = 'false';
                    loreElement.contentEditable = 'false';

                    charactersEdit[index].style.display = 'inline';
                    charactersSave[index].style.display = 'none';
                    drawCharacters();
                    showToast(`Character has been updated`);

                });
            });
        });
    });
};

drawCharacters();

const charactersForm = document.querySelector('.js-characters-form');
const characterSelect = document.querySelector<HTMLSelectElement>('.js-character-select');

charactersForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const charactersNameInput = charactersForm.querySelector<HTMLInputElement>('input[name=name]');
    const charactersRaceInput = charactersForm.querySelector<HTMLSelectElement>('select[name=race]');
    const charactersAgeInput = charactersForm.querySelector<HTMLInputElement>('input[name=age]');
    const charactersClassInput = charactersForm.querySelector<HTMLInputElement>('input[name=class]:checked');
    const charactersLoreInput = charactersForm.querySelector<HTMLInputElement>('input[name=lore]');

    if (
        charactersNameInput &&
        charactersRaceInput &&
        charactersAgeInput &&
        charactersClassInput &&
        charactersLoreInput
    ) {
        const timestamp = Date.now();
        axios.post<Characters>('http://localhost:3004/characters', {
            name: charactersNameInput.value,
            race: charactersRaceInput.value,
            age: parseInt(charactersAgeInput.value, 10),
            class: charactersClassInput?.value, // Use optional chaining in case no radio button is selected
            lore: charactersLoreInput.value,
            timestamp,
        }).then(() => {
            charactersNameInput.value = '';
            charactersRaceInput.value = '';
            charactersAgeInput.value = '';
            charactersClassInput?.removeAttribute('checked'); // Uncheck the radio button
            charactersLoreInput.value = '';
            drawCharacters();
            showToast('Characters has been added');
        });
    } else {
        console.error('One or more form elements not found.');
    }
});

