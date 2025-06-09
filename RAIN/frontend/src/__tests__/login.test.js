import { render, screen, fireEvent, waitFor } from '@testing-library/react';// Uvozi funkcije iz knjižnice React Testing Library za renderiranje komponent, iskanje elementov, simulacijo dogodkov in čakanje na asinkrone spremembe.
import Login from '../components/Login';// Uvozi komponento Login, ki jo bomo testirali.
import { UserContext } from '../userContext';// Uvozi UserContext, ki bo uporabljen za zagotavljanje uporabniškega konteksta v testu.

test('logs in successfully with correct credentials', async () => {  // Definira testni primer z opisom, kaj test preverja - uspešna prijava z veljavnimi podatki.
  const setUserContext = jest.fn();  // Ustvari lažno funkcijo za setUserContext, ki jo bomo preverili, če je bila klicana.
  global.fetch = jest.fn(() =>
    Promise.resolve({    // Nadomesti globalno funkcijo fetch z lažno implementacijo, ki vedno vrne določen odgovor.
      json: () =>
        Promise.resolve({ // Simulira metodo json, ki vrne obljubo z uporabniškimi podatki.
          _id: '123',
          username: 'Dwayne',// Vrnjenih podatki za uporabnika.
        }),
    })
  );

  delete window.location; // Odstrani obstoječo lastnost window.location, da jo lahko nadomestimo.
  window.location = { href: '' };// Ustvari lažen window.location objekt z lastnostjo href, ki jo bomo lahko spremljali.

  render(
    <UserContext.Provider value={{ setUserContext }}> {/* Z uporabniškim kontekstom zagotovimo mock funkcijo setUserContext v komponenti Login */}
      <Login /> {/* Renderira komponento Login */}
    </UserContext.Provider>
  );

  fireEvent.change(screen.getByPlaceholderText(/username/i), {    // Poišče vnosno polje za uporabniško ime preko placeholder besedila in simulira vnos vrednosti 'Dwayne'.
    target: { value: 'Dwayne' },
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {    // Poišče vnosno polje za geslo preko placeholder besedila in simulira vnos vrednosti 'dwyane'.
    target: { value: 'dwyane' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));  // Poišče gumb za prijavo in simulira klik na njega.
  await waitFor(() => expect(setUserContext).toHaveBeenCalledWith({ // Čaka, da se setUserContext pokliče z določenimi podatki (simulirani podatki uporabnika).
    _id: '123',
    username: 'Dwayne',
  }));

  expect(window.location.href).toBe('/');  // Preveri, da se je URL preusmeril na domačo stran po uspešni prijavi.
});
