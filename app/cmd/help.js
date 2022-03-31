/* eslint-disable prettier/prettier */
const { MessageEmbed } = require('discord.js');

module.exports = function handleHelp(msg) {
    var strCmd = msg.content.replace(/　/g, ' ');
    strCmd = strCmd.replace('  ', ' ');
    const args = strCmd.split(' ');
    args.shift();
    if (args[0] == 'voice') {
        msg.channel.send({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: "Πώς να χρησιμοποιήσετε το Bukiti(読み上げbot)",
                iconURL:
                  "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg",
              })
              .setColor(0x1bc2a5)
              .addFields([
                {
                  name: "Συνδεθείτε με τον Bukiti στο φωνητικό κανάλι.",
                  value: "```!join```\n",
                },
                {
                  name: "Απαριθμεί τους τύπους φωνής που είναι διαθέσιμοι στο API",
                  value: "```!type```\n",
                },
                {
                  name: "Αλλαγή τύπου φωνής.",
                  value: "```!voice```\n",
                },
                {
                  name: "Αποσύνδεση των bookies από το φωνητικό κανάλι.",
                  value: "```!kill```\n",
                },
              ]),
          ],
        });
    } else if (args[0] == '2') {
        msg.channel.send({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: "Πώς να χρησιμοποιήσετε το Bukiti(2/2)",
                iconURL:
                  "https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg",
              })
              .setColor(0x1bc2a5)
              .addFields([
                {
                  name: "Εμφάνιση πληροφοριών σκηνής.[now / next / nawabari / run]",
                  value: "```show ○○○```\n",
                },
                {
                  name: "τυχαία εντολή",
                  value:
                    "Τυχαία επιλογή στοιχημάτων.```buki Αν είναι περισσότερα από ένα, συμπληρώστε τον αριθμό```\n" +
                    "Αναφέρετε τη μέθοδο τυχαίας επιλογής για κάθε τύπο buki: ```buki help```\n" +
                    "Choose a weapon randomly:```weapon```\n" +
                    "Choose a weapon randomly help:```weapon help```\n" +
                    "Τυχαία επιλεγμένοι κανόνες Gatil：```rule```\n" +
                    "Τυχαία επιλογή φρικτών κανόνων και σταδίων.：```rule stage```\n" +
                    "Τυχαία επιλεγμένα υποόπλα.：```sub```\n" +
                    "Τυχαία επιλεγμένο ειδικό όπλο.：```special```",
                },
                {
                  name: "Τυχαία επιλογή από μια σειρά επιλογών",
                  value:
                    "```pick Σε περίπτωση πολλαπλών επιλογών, συμπληρώστε τους αριθμούς Μισό διάστημα μεταξύ των επιλογών ή διάλειμμα γραμμής```",
                },
                {
                  name: "Τυχαία εξαγωγή ανθρώπων για έναν αριθμό από τον συνδεδεμένο λέβητα.",
                  value:
                    "```vpick Εάν εκλεγούν περισσότεροι από ένας, συμπληρώστε τους αριθμούς```",
                },
                {
                  name: "Απόσπασμα Prave θεατών.",
                  value:
                    "```kansen Συμπληρώστε τους αριθμούς για τον αριθμό των αντιστοιχιών.```",
                },
                {
                  name: "Πραγματοποιήστε μια έρευνα (όσες θέλετε, διαχωρισμένες με κενά).",
                  value: "```poll Επιλογή 1 Επιλογή 2```",
                },
                {
                  name: "Δείτε τους δικούς σας κωδικούς φίλων.",
                  value:
                    "```fc @εγώ ο ίδιος```\nΑν αναφέρεται στα τελευταία 100 κανάλια κωδικός φίλου αυτό έχει προτεραιότητα.",
                },
                {
                  name: "Καταχωρήστε τον δικό σας κωδικό φίλου.",
                  value:
                    "```fcadd 0000-0000-0000```\nΕάν εγγραφείτε ξανά, θα αντικατασταθεί. Δεν μπορείτε να καταχωρίσετε το όνομα κάποιου άλλου.",
                },
                {
                  name: "Δείτε το ιστορικό της λέσχης καλαμαριών σας.",
                  value: "```@ブキチ イカ部歴```\n",
                },
                {
                  name: "Ελέγξτε τη wikipedia.",
                  value: "```wiki 〇〇```",
                },
              ]),
          ],
        });
    } else {
        msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: 'Πώς να χρησιμοποιήσετε το Bukiti(1/2)',
                        iconURL: 'https://cdn.glitch.com/4ea6ca87-8ea7-482c-ab74-7aee445ea445%2Fthumbnails%2Fbukichi.jpg',
                    })
                    .setColor(0x1bc2a5)
                    .addFields([
                        {
                            name: 'Εμφάνιση μιας λίστας εντολών bot.',
                            value: '```help または help 2 または help voice```',
                        },
                        {
                            name: 'Εμφάνιση τρεχουσών πληροφοριών και προσλήψεων Rigma',
                            value: '```now Όροι συμμετοχής, αν υπάρχουν.```\n',
                        },
                        {
                            name: 'Εμφάνιση των επόμενων πληροφοριών rigma και πρόσληψη.',
                            value: '```next Όροι συμμετοχής, αν υπάρχουν.```\n',
                        },
                        {
                            name: 'Εμφάνιση τρεχουσών πληροφοριών και προσλήψεων του NAWABARI',
                            value: '```nawabari Όροι συμμετοχής, αν υπάρχουν.```\n',
                        },
                        {
                            name: 'Εμφάνιση πληροφοριών και προσλήψεων για το Salmon Run.',
                            value: '```run Όροι συμμετοχής, αν υπάρχουν.```\n',
                        },
                        {
                            name: 'Ξεχωριστή εντολή πρόσληψης παιχνιδιού',
                            value:
                                'Dead by Daylight：```!dbd Όροι συμμετοχής, αν υπάρχουν.```\n' +
                                'モンスターハンターライズ：```!mhr Όροι συμμετοχής, αν υπάρχουν.```\n' +
                                'ApexLegends：```!apex Όροι συμμετοχής, αν υπάρχουν.```\n',
                        },
                    ]),
            ],
        });
    }
};
