/*
 * Invitation settings. This is the only file to edit for the RSVP setup.
 * Texts shown on the page (date, address) live in index.html: keep them in sync.
 */
window.INVITO_CONFIG = {
  // Address that receives the RSVP replies, e.g. 'nome.cognome@gmail.com'
  rsvpEmail: '',

  // Optional: Web3Forms access key (free, see README). When set, replies are
  // emailed automatically; otherwise the guest's mail app opens with the reply
  // already written and the guest only has to press "Send".
  web3formsKey: '',

  // Party start, ISO 8601 with Italian time zone (+01:00 in winter, +02:00 in summer).
  eventStart: '2027-01-23T19:30:00+01:00',
  // End time is indicative: it is only used for the "add to calendar" links.
  eventEnd: '2027-01-23T23:30:00+01:00',

  eventTitle: 'Festa dei 30 anni di Marta',
  venueName: 'Iron Music Store',
  venueAddress: 'Via di Porto, 20/A - 50018 Scandicci (FI)',
};
