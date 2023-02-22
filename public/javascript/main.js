const game_interface = {
//stan okna menu 
    menu_form_is_login : true,
//=============================================== konfiguracja inputów ===============================================
// min length, max length są jasne xD pattern tj wzór zgoności z kluczem. kopiowane z neta, ale działa. pattern error text tj to
// co się wyświetla jak jest błąd spowodowany przez pattern
    menu_form_input_config : {
        login : {min_length : 3, max_length : 25, pattern : "^[0-9a-zA-Z_.-]+$", pattern_error_text : 'Może zawierać litery, cyfry i znaki _-.'},
        email : {/*min_length : 8, max_length : 255,*/ pattern : "^[0-9a-zA-Z_.-]+@[0-9a-zA-Z.-]+\.[a-zA-Z]{2,3}$", pattern_error_text : 'Niepoprawny adres e-mail'},
        password : {min_length : 8, max_length : 255, pattern : "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{1,255}$", pattern_error_text : 'Musi zawierać cyfrę i wielką literę'}, //(?=.*[ -/:-@\[-`{-~]) dodaje znaki specjalne wstawić przed .{1,255}
        checkbox : {pattern_error_text : 'Wymagana akceptacja'}
    },
//=============================================== konfiguracja menu logowania =============================================
//konfiguracja tego co jest generowanym komentarzem. legend tj nagłowek formularza, type jest typem, label tj opis pola,
// validation t/f czy pole ma być sprawdzane, czy nie i require, czy ma być wymagane, czy nie 
    menu_form_login_config : {
        legend : 'Zaloguj się:',
        login : {type : 'text', label : 'login: ',validation : false, require : true},
        password : {type : 'password', label : 'hasło: ', validation : false, require : true},
        renember : {type : 'checkbox', value : 'zapamiętaj',validation : false, require : false },
        send : {type : 'submit', value : "Zaloguj"},
        change : {type : 'button', value : "Rejestracja"}
    },
//=============================================== konfiguracja menu rejestracji =============================================
    menu_form_registration_config : {
        legend : 'Zarejestruj się:',
        login : {type : 'text', label : 'login: ', validation : true, require : true},
        email : {type : 'email',label : 'e-mail: ', validation : true, require : true},
        password : {type : 'password', label : 'hasło: ', validation : true, require : true},
        regulations : {type : 'checkbox', value : 'akceptuję <input type="button" value="regulamin" id="regulamin">', validation : false, require : true },
        send : {type : 'submit', value : "Zarejestruj"},
        change : {type : 'button', value : "Wróć"}
    },
//=======================================================  Funkcje  ==================================================
//funkcja generująca pola formularzy menu na podstawie danych konfiguracyjnych 
    generate_menu_form_content : (form) => {
    //w configu jest zapisany obiekt konfiguracyjny w zależności od tego, czy wywołuje formularz login, czy registration,
    //content jest zwracanym stringiem wklejanym przez funkcję wywołującą do elementu
        const config = game_interface[`menu_form_${form}_config`]
        let content = '<fieldset>';
    //pętla po obiekcie config
        for(let input in config){
    //jak jest legendą dodaj tekst do content
            if(input === 'legend')
                content += `<legend>${config[input]}</legend>`;
    //to są przyciski, oba mają identyczne ID dla obu formularzy, bo tylko 1 formularz jest aktywny.
            else if(input === 'send' || input === 'change')
                content += `<input type="${config[input].type}" value="${config[input].value}" id="${input}">`;
    //to jest dla checkboxów, z racji tego, że nie można podmienić checkboxowi backgrouda jak img, musi być taki pojebany zapis
    //spowodowany pojebaniem totalnym. css jakoś to ogarnia. W razie jak można dodać inaczej bg img do cb, poproszę o sposób - uprości w uj kod
            else if(config[input].type == 'checkbox')
                content +=`<label for="${input}"  class="cbLabel">${config[input].value}
                                <input type="${config[input].type}" id="${input}"  value=""><span class="cb"></span></label><p class="error"></p>`;
    // dodaje odpowiednie pole tekstowe. bez szału
            else
                content += `<label for="${input}">${config[input].label}</label><input type="${config[input].type}" id="${input}" /><p class="error"></p>`
        }
    //finish i zwrot stringa
        content += `</fieldset>`;
        return content;
    },
//funkcja startowa dla menu_form. zmiana stanu i zawartości okienka menu form
    change_menu_form_content : () => {
    //zmienna z oknem formularza do którego będzie generowany formularz
        let form = document.querySelector('#menu_form');
    //wsadzanie do zmiennej form tego co zwróci funkcja generate_menu_form_content. w argumencie jest sprawdzenie warunku
    //jak game_interface.menu_form_is_login jest true argumentem jest login jak false registration funkcja linijka +- 36
        form.innerHTML = game_interface.generate_menu_form_content(game_interface.menu_form_is_login ? `login` : `registration`)
    //jeśli naciśnięty zostanie przycisk zmieniający login na registration, to funkcja wywołuje samą siebie
        document.querySelector('#change').addEventListener("click", ()=>{
            game_interface.change_menu_form_content();
        });
    //jeśli zostanie naciśnięty przycisk wysyłki, zostaje zablokowane normalne wysyłanie formularza w stylu php i wywołana funkcja
    //wysyłająca i sprawdzająca, czy nie ma błędów w formularzu (nienapisana, jest tylko console.log zamiast niej xD)
        document.querySelector('#send').addEventListener("click", (e)=>{
            e.preventDefault()
            console.log('funkcja sprawdzająca, czy wszystko jest ok przed wysyłką');
        });
//wszystkie pola tekstowe są wyłapane przez querySelectorAll i dodane jest do nich zdarzenie keyup i change
//change jest w razie jakby zamiast kliknięcia klawisza przy wpisywaniu ktoś wkleił tekst do formularza
//wywoływana jest funkcja validation_menu_input linijka +- 97
        let inputs = form.querySelectorAll('input[type=text], input[type=password], input[type=email]');
        
        inputs.forEach((input)=>{
            input.addEventListener('keyup', ()=>{game_interface.validation_menu_input(input, 'input')})
            input.addEventListener('change', ()=>{game_interface.validation_menu_input(input, 'input')})
        });
// jak wyżej tylko do chceckboxów i event jest click
        let checkbox = form.querySelectorAll('input[type=checkbox]')
        checkbox.forEach((input)=>{
            input.addEventListener('click', ()=>{game_interface.validation_menu_checkbox(input, 'checkbox')})
        });
// na koniec z racji zmiany stanu formularza zmieniane jest menu_form_is_login na przeciwne. na tej zmiennej opiera się info
//dla skryptów który formularz aktualnie ogarniają
        game_interface.menu_form_is_login = !game_interface.menu_form_is_login;
        
    },
//odwalanie walidacji pól formularza xD
    validation_menu_input(input, type){
    // sprawdza który formularz jest odwalany
    // type wskazuje, czy funkcja ogarnia checkboxym czy pola tekstowe. z racji chujni z wyglądem CB tak musi póki co być
    //lepszego rozwiązania aktualnie nie widzę
        const form = game_interface.menu_form_is_login ?  'registration' : 'login';

        if(type === 'checkbox'){
        // jeśli obiekt jest checkboxem jest wymagany, ale nie jest zaznaczony dodaje błąd, w przeciwnym razie go usuwa
            if(game_interface[`menu_form_${form}_config`][input.id].require === true && input.checked === false){
                input.parentElement.nextElementSibling.innerHTML = game_interface.menu_form_input_config.checkbox.pattern_error_text;
                input.nextElementSibling.classList.add('is_error');
            }else{
                input.parentElement.nextElementSibling.innerHTML = null;
                input.nextElementSibling.classList.remove('is_error');
            }
        }else if(type === 'input'){
            //jeśli obiekt jest inputem i wymagana jest jego walidacja
            if(game_interface[`menu_form_${form}_config`][input.id].validation === true){
//zmienne pomocnicze 
                let rules = game_interface.menu_form_input_config[input.id];
                let reg =  (rules.pattern !== undefined) ? new RegExp(rules.pattern) : undefined;
// jeśli wymagana jest minumalna długoś i jest za krótki dodaje błąd funkcja error_text +- 140
                if(rules.min_length !== undefined && rules.min_length > input.value.length){
                    game_interface.error_text(input, `min. ${rules.min_length} znaki`, true);
// jeśli wymagana jest maksymalan długość i jest za długi dodaje błąd
                }else if(rules.max_length !== undefined && rules.max_length < input.value.length){
                    game_interface.error_text(input, `max. ${rules.max_length} znaki`, true);
// jeśli są wymagania odnośnie wyrażenia regularnego i nie spełnia ich dodaje błąd 
                }else if(reg !== undefined && !reg.test(input.value)){
                    game_interface.error_text(input,  rules.pattern_error_text, true);
//else oznacza, że wszystko jest ok i usuwane są błędy
                }else{
                    game_interface.error_text(input,  null, false);
                }
            }
        }
//jeśli są błędy blokuje przycisk send, jak nie odblokowuje go
        if(document.querySelector('#menu_form').querySelector('.is_error') !== null) {
            document.querySelector('#menu_form').querySelector('#send').setAttribute('disabled', '');
        }else{
            document.querySelector('#menu_form').querySelector('#send').removeAttribute('disabled') ;
        }
    },
//funkcja pomocnicza obsługująca błędy
// proste nie tłumaczę xD
    error_text : (input, text, is_err)=>{
        input.nextElementSibling.innerHTML = text;
        is_err ? input.nextElementSibling.classList.add('is_error') : input.nextElementSibling.classList.remove('is_error');
    }
}


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! załaduj po wczytaniu dokumentu !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
document.addEventListener("DOMContentLoaded", () => {
//wywołanie funkcji inicjującej / startującej z linijki +- 58 (komentarze mogły przesunąć)   
    game_interface.change_menu_form_content();
});