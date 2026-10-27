      const views = [...document.querySelectorAll('.view')],
        bottom = document.getElementById('bottomBar');
      let currentGame = 1,
        currentField = null,
        targetCount = 1;
      function activate(id) {
        views.forEach((v) => v.classList.toggle('active', v.id === id));
        bottom.style.display = id === 'listView' ? 'flex' : 'none';
        document.querySelector('.app').classList.toggle('auth-mode', id === 'authView');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      function showList() {
        activate('listView');
      }
      function showAuth() {
        activate('authView');
      }
      document.querySelectorAll('[data-note]').forEach((button) => {
        button.addEventListener('click', () => {
          const note = document.getElementById(button.dataset.note);
          note.hidden = !note.hidden;
          button.setAttribute('aria-expanded', String(!note.hidden));
          if (!note.hidden) note.focus();
        });
      });
      let isAuthorized = false;
      document.getElementById('authSubmit').addEventListener('click', () => {
        isAuthorized = !isAuthorized;
        const status = document.getElementById('authStatus');
        const button = document.getElementById('authSubmit');
        status.textContent = isAuthorized ? 'Autorizováno' : 'Neautorizováno';
        status.classList.toggle('is-authorized', isAuthorized);
        button.textContent = isAuthorized ? 'Zrušit autorizaci' : 'Autorizovat';
        button.classList.toggle('is-authorized', isAuthorized);
        document.getElementById('authAuditAuthorized').hidden = !isAuthorized;
      });
      function openGame(n, pair) {
        currentGame = n;

        document.getElementById('gameTitle').textContent =
          'Zápas ' + n + ' / ' + (pair ? 'Pairs' : 'Single');

        document.getElementById('statsBlock').hidden = pair;
        document.getElementById('pairNote').hidden = !pair;

        activate('detailView');
      }
      const playerRosters = {
        home: [
          'Buvol Libor',
          'Řídký Michal',
          'Svoboda Robert',
          'Zmrzlý Jan',
          'Pavel Procházka',
          'Jakub Veselý',
        ],
        away: [
          'Nymburk Ladislav',
          'Nymburk Tomáš',
          'Nymburk Jan',
          'Nymburk Lukáš',
          'Petr Svoboda',
          'Jan Novák',
        ],
      };
      // Demo states for the static prototype; replace with real lineup data.
      const alreadyAssignedPlayers = {
        home: ['Svoboda Robert', 'Zmrzlý Jan'],
        away: ['Nymburk Jan', 'Nymburk Lukáš'],
      };
      let pickerSide = 'home';
      function openPlayerPicker(side, target = null) {
        pickerSide = side;
        const button = target === null ? document.querySelector('.detail-mobile-card [data-player-side="' + side + '"]') : document.querySelector('.tablet-target[data-target="' + target + '"] [data-player-side="' + side + '"]');
        const current = button.textContent.replace(/⌄\s*$/, '').trim();
        document.getElementById('playerPickerTitle').textContent =
          'Vybrat hráče — ' + (side === 'home' ? 'D1' : 'H3');
        const options = document.getElementById('playerPickerOptions');
        options.replaceChildren();
        const roster = playerRosters[side];
        const names = roster.includes(current) ? roster : [current, ...roster];
        names.forEach((name) => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'player-picker__item';
          const isCurrent = name === current;
          if (isCurrent) item.classList.add('is-current');
          const isUsed = !isCurrent && alreadyAssignedPlayers[side].includes(name);
          if (isUsed) {
            item.classList.add('is-used');
            item.disabled = true;
            item.setAttribute('aria-disabled', 'true');
          }
          const nameText = document.createElement('span');
          nameText.textContent = name;
          const note = document.createElement('span');
          note.className = 'player-picker__note';
          note.textContent = isCurrent ? 'Aktuální' : isUsed ? 'Již nasazen' : '';
          item.append(nameText, note);
          item.addEventListener('click', () => {
            button.textContent = name;
            activate('detailView');
          });
          options.append(item);
        });
        activate('playerPickerView');
      }
      function closePlayerPicker() {
        activate('detailView');
      }
      let editedLegsButton = null;
      let legEditMode = 'plus';
      const legEditInputs = [
        document.getElementById('legsHomeScore'),
        document.getElementById('legsAwayScore'),
      ];
      document.querySelectorAll('[data-leg-mode]').forEach((button) => {
        button.addEventListener('click', () => {
          legEditMode = button.dataset.legMode;
          document.querySelectorAll('[data-leg-mode]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('active', active);
            item.setAttribute('aria-pressed', String(active));
          });
        });
      });
      legEditInputs.forEach((input) => {
        input.addEventListener('click', () => {
          const current = Number(input.value) || 0;
          input.value = String(Math.max(0, Math.min(99, current + (legEditMode === 'plus' ? 1 : -1))));
          input.classList.add('is-selected');
          legEditInputs.filter((item) => item !== input).forEach((item) => item.classList.remove('is-selected'));
        });
      });
      function openLegsEditor(button) {
        editedLegsButton = button;
        document.getElementById('legsEditorMatchTitle').textContent = 'Zápas ' + currentGame + ' / 14';
        document.getElementById('legsEditorMatchType').textContent = currentGame === 5 ? 'Dvojice' : 'Jednotlivci';
        const detailScore = document.querySelector('#detailView .match-result__score');
        document.querySelector('#legsEditorView .match-result__score').innerHTML = detailScore.innerHTML;
        const card = button.closest('.game-card');
        const names = card.querySelectorAll('.player-select');
        document.getElementById('legsHomeName').textContent = names[0]?.textContent.trim() || 'Domácí';
        document.getElementById('legsAwayName').textContent = names[1]?.textContent.trim() || 'Hosté';
        const values = button.textContent.split(':').map(value => Number(value.trim()));
        document.getElementById('legsHomeScore').value = Number.isFinite(values[0]) ? values[0] : 0;
        document.getElementById('legsAwayScore').value = Number.isFinite(values[1]) ? values[1] : 0;
        activate('legsEditorView');
      }
      function closeLegsEditor() {
        activate('detailView');
      }
      document.getElementById('legsEditorForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity() || !editedLegsButton) return;
        const home = Number(document.getElementById('legsHomeScore').value);
        const away = Number(document.getElementById('legsAwayScore').value);
        if (![home, away].every(value => Number.isInteger(value) && value >= 0 && value <= 99)) return;
        editedLegsButton.textContent = home + ' : ' + away;
        editedLegsButton.dataset.homeLegs = String(home);
        editedLegsButton.dataset.awayLegs = String(away);
        closeLegsEditor();
      });
      function shiftGame(dir) {
        let next = currentGame + dir;
        if (next < 1) next = 6;
        if (next > 6) next = 1;
        openGame(next, next === 5);
      }
      function saveGame() {
        shiftGame(1);
      }
      document.querySelectorAll('.target-btn').forEach((btn) =>
        btn.addEventListener('click', () => {
          targetCount = Number(btn.dataset.targets);
          document
            .querySelectorAll('.target-btn')
            .forEach((b) => b.classList.toggle('active', b === btn));
        }),
      );
      let scoreMode = 'plus';
      const scoreModeButtons = document.querySelectorAll('[data-score-mode]');
      scoreModeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          scoreMode = button.dataset.scoreMode;
          scoreModeButtons.forEach((item) => {
            const active = item === button;
            item.classList.toggle('active', active);
            item.setAttribute('aria-pressed', String(active));
          });
        });
      });
      document.getElementById('detailView').addEventListener('click', (event) => {
        const field = event.target.closest('button.value');
        if (!field) return;
        const current = Number(field.dataset.value) || 0;
        const next = Math.max(0, current + (scoreMode === 'plus' ? 1 : -1));
        field.dataset.value = String(next);
        field.textContent = String(next);
      });
