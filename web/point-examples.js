const c=(r,s)=>({r,s}),triple=(r,s)=>Array.from({length:3},()=>c(r,s));
const marriage=[c(10,'C'),c(11,'C'),c(12,'C')];
export const EXAMPLE_MAAL=c(11,'C');
export const POINT_EXAMPLES={
 tiplu:{cards:[c(11,'C')],en:'Tiplu matches the flipped maal in both rank and suit. With J♣ flipped, the other J♣ cards are Tiplu.',ne:'टिप्लुको अंक र चिन्ह पल्टिएको मालसँग मिल्छ। J♣ माल भए बाँकी J♣ टिप्लु हुन्।'},
 poplu:{cards:[c(12,'C')],en:'Poplu is one rank above Tiplu in the same suit: Q♣ when the maal is J♣.',ne:'पोप्लु टिप्लुभन्दा एक अंक माथि, उही चिन्हको पत्ती हो। J♣ माल भए Q♣ पोप्लु हो।'},
 jhiplu:{cards:[c(10,'C')],en:'Jhiplu is one rank below Tiplu in the same suit: 10♣ when the maal is J♣.',ne:'झिप्लु टिप्लुभन्दा एक अंक तल, उही चिन्हको पत्ती हो। J♣ माल भए 10♣ झिप्लु हो।'},
 alter:{cards:[c(11,'S')],en:'Alter has the same rank and colour as Tiplu, but the other suit: J♠ for J♣. Hearts and diamonds are the other matching-colour pair.',ne:'अल्टरको अंक र रङ टिप्लुसँग मिल्छ तर चिन्ह फरक हुन्छ। J♣ को अल्टर J♠ हो। रातोमा हर्ट र डायमन्डको जोडी हुन्छ।'},
 putali:{cards:[c(15,'J')],en:'Putali / Man is a separate printed joker, when included in your chosen deck. It is not another name for Tiplu.',ne:'पुतली / म्यान छानिएको डेकमा राखिने छुट्टै छापिएको जोकर हो। यो टिप्लुको अर्को नाम होइन।'},
 marriage:{cards:marriage,en:'One Jhiplu + Tiplu + Poplu of the same suit: 10♣ J♣ Q♣. A hand / mixed marriage may combine eligible cards from the hand and ground; its cards are not also counted separately.',ne:'उही चिन्हका झिप्लु + टिप्लु + पोप्लु: 10♣ J♣ Q♣। हात वा हात र भुइँका मिल्ने पत्तीबाट बनेको म्यारिज हो। यी पत्तीको अंक फेरि छुट्टै गनिँदैन।'},
 groundMarriage:{cards:marriage,en:'The same marriage triplet, exposed together as one opening sequence before viewing the maal. Combining cards from separate exposed groups does not make a ground marriage.',ne:'माल हेर्नुअघि एउटै सिक्वेन्सको रूपमा भुइँमा देखाएको 10♣ J♣ Q♣। फरक देखाइएका सेटबाट पत्ती मिलाउँदा यो भुइँ म्यारिज हुँदैन।'},
 normalTunnelas:{cards:triple(7,'H'),en:'An ordinary tunnela is three identical non-wild cards: same rank and same suit, from the three decks. Here: three 7♥ cards.',ne:'साधारण टनेला तीन डेकबाट आएका उही अंक र चिन्हका तीन गैर-जोकर पत्ती हुन्। उदाहरण: तीनवटा 7♥।'},
 master:{cards:[c(16,'M')],en:'Master is a separate special card, included only when enabled in the deck settings.',ne:'मास्टर छुट्टै विशेष पत्ती हो। डेकको सेटिङमा खोलिएको भए मात्र समावेश हुन्छ।'},
 superman:{cards:[c(17,'U')],en:'Superman is a separate optional wildcard. Its inclusion and opening-sequence use follow your table settings.',ne:'सुपरम्यान छुट्टै वैकल्पिक जोकर हो। यसलाई राख्ने र सुरुको सिक्वेन्समा प्रयोग गर्ने नियम टेबलको सेटिङअनुसार हुन्छ।'},
 jokerTunnela:{cards:triple(11,'H'),en:'Three identical ordinary jokers. With J♣ as maal, three J♥ cards are an example. J♥ and J♦ act as jokers; their individual maal value is zero in the Nepali preset.',ne:'तीनवटा उस्तै साधारण जोकर। J♣ माल भए तीन J♥ यसको उदाहरण हुन्। नेपाली प्रिसेटमा J♥ र J♦ जोकर हुन्छन् तर छुट्टाछुट्टै माल अंक हुँदैन।'},
 popluTunnela:{cards:triple(12,'C'),en:'Three identical Poplu cards: three Q♣ cards when the maal is J♣.',ne:'तीनवटा उस्तै पोप्लु। J♣ माल भए तीन Q♣।'},
 jhipluTunnela:{cards:triple(10,'C'),en:'Three identical Jhiplu cards: three 10♣ cards when the maal is J♣.',ne:'तीनवटा उस्तै झिप्लु। J♣ माल भए तीन 10♣।'},
 alterTunnela:{cards:triple(11,'S'),en:'Three identical Alter cards: three J♠ cards when the maal is J♣.',ne:'तीनवटा उस्तै अल्टर। J♣ माल भए तीन J♠।'},
 manTunnela:{cards:triple(15,'J'),en:'All three printed Man / Putali jokers together, when these cards are included in the deck.',ne:'डेकमा पुतली राखिएको छ भने तीनवटै छापिएका म्यान / पुतली जोकरको सेट।'},
 tripleBonus:{cards:[...triple(7,'H'),...triple(8,'D'),...triple(13,'C')],en:'Three exposed tunnelas. This is an optional extra bonus, separate from the sets themselves and zero by default. Three tunnelas do not automatically finish the game.',ne:'भुइँमा देखाइएका तीन टनेला। यो टनेलाको आफ्नै अंकबाहेकको वैकल्पिक थप बोनस हो, सुरुमा शून्य हुन्छ। तीन टनेलाले मात्र खेल स्वतः सकिँदैन।'}
};
