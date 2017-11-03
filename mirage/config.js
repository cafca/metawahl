const occasions = [
  {
    "occasion_id": "1",
    "type": "Wahl-O-Mat",
    "date": "2003-09-21",
    "territory": "bayern",
    "wikidata": "Q554356",
    "extraData": {
      "texts": []
    },
    "num": 0,
    "title": "Bayern"
  },
  {
    "occasion_id": "3",
    "type": "Wahl-O-Mat",
    "date": "2004-06-13",
    "territory": "europa",
    "wikidata": "Q639497",
    "extraData": {
      "texts": []
    },
    "num": 1,
    "title": "Europawahl 2004"
  },
  {
    "occasion_id": "5",
    "type": "Wahl-O-Mat",
    "date": "2004-09-19",
    "territory": "sachsen",
    "wikidata": "Q1512921",
    "extraData": {
      "texts": []
    },
    "num": 2,
    "title": "Landtagswahl Sachsen 2004"
  },
  {
    "occasion_id": "4",
    "type": "Wahl-O-Mat",
    "date": "2004-09-05",
    "territory": "saarland",
    "wikidata": "Q828540",
    "extraData": {
      "texts": []
    },
    "num": 3,
    "title": "Landtagswahl Saarland 2004"
  },
  {
    "occasion_id": "7",
    "type": "Wahl-O-Mat",
    "date": "2005-05-22",
    "territory": "nordrhein-westfalen",
    "wikidata": "Q686765",
    "extraData": {
      "texts": []
    },
    "num": 4,
    "title": "Landtagswahl Nordrhein-Westfalen 2005"
  },
  {
    "occasion_id": "6",
    "type": "Wahl-O-Mat",
    "date": "2005-02-20",
    "territory": "schleswig-holstein",
    "wikidata": "Q824600",
    "extraData": {
      "texts": []
    },
    "num": 5,
    "title": "Landtagswahl Schleswig-Holstein 2005"
  },
  {
    "occasion_id": "8",
    "type": "Wahl-O-Mat",
    "date": "2005-09-18",
    "territory": "deutschland",
    "wikidata": "Q165999",
    "extraData": {
      "texts": []
    },
    "num": 6,
    "title": "Bundestagswahl 2005"
  },
  {
    "occasion_id": "11",
    "type": "Wahl-O-Mat",
    "date": "2006-03-26",
    "territory": "sachsen-anhalt",
    "wikidata": "Q874864",
    "extraData": {
      "texts": []
    },
    "num": 7,
    "title": "Landtagswahl in Sachsen-Anhalt 2006"
  },
  {
    "occasion_id": "9",
    "type": "Wahl-O-Mat",
    "date": "2006-03-26",
    "territory": "rheinland-pfalz",
    "wikidata": "Q822312",
    "extraData": {
      "texts": []
    },
    "num": 8,
    "title": "Landtagswahl in Rheinland-Pfalz 2006"
  },
  {
    "occasion_id": "12",
    "type": "Wahl-O-Mat",
    "date": "2006-09-17",
    "territory": "berlin",
    "wikidata": "Q2539361",
    "extraData": {
      "texts": []
    },
    "num": 9,
    "title": "Wahl 2006 zum Abgeordnetenhaus von Berlin"
  },
  {
    "occasion_id": "10",
    "type": "Wahl-O-Mat",
    "date": "2006-03-26",
    "territory": "baden-wuerttemberg",
    "wikidata": "Q325315",
    "extraData": {
      "texts": []
    },
    "num": 10,
    "title": "Landtagswahl in Baden-Württemberg 2006"
  },
  {
    "occasion_id": "14",
    "type": "Wahl-O-Mat",
    "date": "2008-01-27",
    "territory": "niedersachsen",
    "wikidata": "Q324296",
    "extraData": {
      "texts": []
    },
    "num": 11,
    "title": "Landtagswahl in Niedersachsen 2008"
  },
  {
    "occasion_id": "13",
    "type": "Wahl-O-Mat",
    "date": "2007-05-13",
    "territory": "bremen",
    "wikidata": "Q486916",
    "extraData": {
      "texts": []
    },
    "num": 12,
    "title": "Wahl der Bremischen Bürgerschaft 2007"
  },
  {
    "occasion_id": "15",
    "type": "Wahl-O-Mat",
    "date": "2008-02-24",
    "territory": "hamburg",
    "wikidata": "Q836394",
    "extraData": {
      "texts": []
    },
    "num": 13,
    "title": "Wahl der Hamburgischen Bürgerschaft 2008"
  },
  {
    "occasion_id": "20",
    "type": "Wahl-O-Mat",
    "date": "2011-02-20",
    "territory": "hamburg",
    "wikidata": "Q455288",
    "extraData": {
      "texts": []
    },
    "num": 14,
    "title": "Bürgerschaftswahl 2011 in Hamburg"
  },
  {
    "occasion_id": "19",
    "type": "Wahl-O-Mat",
    "date": "2010-05-09",
    "territory": "nordrhein-westfalen",
    "wikidata": "Q329191",
    "extraData": {
      "texts": []
    },
    "num": 15,
    "title": "Landtagswahl Nordrhein-Westfalen 2010"
  },
  {
    "occasion_id": "17",
    "type": "Wahl-O-Mat",
    "date": "2009-06-07",
    "territory": "europa",
    "wikidata": "Q701068",
    "extraData": {
      "texts": []
    },
    "num": 16,
    "title": "Europawahl 2009"
  },
  {
    "occasion_id": "18",
    "type": "Wahl-O-Mat",
    "date": "2009-09-27",
    "territory": "deutschland",
    "wikidata": "Q157869",
    "extraData": {
      "texts": []
    },
    "num": 17,
    "title": "Bundestagswahl 2009"
  },
  {
    "occasion_id": "23",
    "type": "Wahl-O-Mat",
    "date": "2011-05-22",
    "territory": "bremen",
    "wikidata": "Q441357",
    "extraData": {
      "texts": []
    },
    "num": 18,
    "title": "Bürgerschaftswahl 2011 in Bremen"
  },
  {
    "occasion_id": "22",
    "type": "Wahl-O-Mat",
    "date": "2011-03-27",
    "territory": "rheinland-pfalz",
    "wikidata": "Q441350",
    "extraData": {
      "texts": []
    },
    "num": 19,
    "title": "Landtagswahl 2011 in Rheinland-Pfalz"
  },
  {
    "occasion_id": "25",
    "type": "Wahl-O-Mat",
    "date": "2012-03-25",
    "territory": "saarland",
    "wikidata": "Q820459",
    "extraData": {
      "texts": []
    },
    "num": 20,
    "title": "Landtagswahl 2012 im Saarland"
  },
  {
    "occasion_id": "24",
    "type": "Wahl-O-Mat",
    "date": "2011-09-18",
    "territory": "berlin",
    "wikidata": "Q455275",
    "extraData": {
      "texts": []
    },
    "num": 21,
    "title": "Abgeordnetenhauswahl 2011 in Berlin"
  },
  {
    "occasion_id": "26",
    "type": "Wahl-O-Mat",
    "date": "2012-05-06",
    "territory": "schleswig-holstein",
    "wikidata": "Q455337",
    "extraData": {
      "texts": []
    },
    "num": 22,
    "title": "Landtagswahl 2012 in Schleswig-Holstein"
  },
  {
    "occasion_id": "27",
    "type": "Wahl-O-Mat",
    "date": "2012-05-13",
    "territory": "nordrhein-westfalen",
    "wikidata": "Q562121",
    "extraData": {
      "texts": []
    },
    "num": 23,
    "title": "Landtagswahl 2012 in Nordrhein-Westfalen"
  },
  {
    "occasion_id": "28",
    "type": "Wahl-O-Mat",
    "date": "2013-01-20",
    "territory": "niedersachsen",
    "wikidata": "Q820632",
    "extraData": {
      "texts": []
    },
    "num": 24,
    "title": "Landtagswahl 2013 in Niedersachsen"
  },
  {
    "occasion_id": "21",
    "type": "Wahl-O-Mat",
    "date": "2011-03-27",
    "territory": "baden-wuerttemberg",
    "wikidata": "Q509629",
    "extraData": {
      "texts": []
    },
    "num": 25,
    "title": "Landtagswahl 2011 in Baden-Württemberg"
  },
  {
    "occasion_id": "29",
    "type": "Wahl-O-Mat",
    "date": "2013-09-15",
    "territory": "bayern",
    "wikidata": "Q1250713",
    "extraData": {
      "texts": []
    },
    "num": 26,
    "title": "Landtagswahl 2013 in Bayern"
  },
  {
    "occasion_id": "34",
    "type": "Wahl-O-Mat",
    "date": "2014-09-14",
    "territory": "thueringen",
    "wikidata": "Q15709742",
    "extraData": {
      "texts": []
    },
    "num": 27,
    "title": "Landtagswahl 2014 in Thüringen"
  },
  {
    "occasion_id": "32",
    "type": "Wahl-O-Mat",
    "date": "2014-08-31",
    "territory": "sachsen",
    "wikidata": "Q1804173",
    "extraData": {
      "texts": []
    },
    "num": 28,
    "title": "Landtagswahl 2014 in Sachsen"
  },
  {
    "occasion_id": "30",
    "type": "Wahl-O-Mat",
    "date": "2013-09-22",
    "territory": "deutschland",
    "wikidata": "Q555931",
    "extraData": {
      "texts": []
    },
    "num": 29,
    "title": "Bundestagswahl 2013"
  },
  {
    "occasion_id": "31",
    "type": "Wahl-O-Mat",
    "date": "2014-05-25",
    "territory": "europa",
    "wikidata": "Q1376107",
    "extraData": {
      "texts": []
    },
    "num": 30,
    "title": "Europawahl 2014"
  },
  {
    "occasion_id": "33",
    "type": "Wahl-O-Mat",
    "date": "2014-09-14",
    "territory": "brandenburg",
    "wikidata": "Q12912393",
    "extraData": {
      "texts": []
    },
    "num": 31,
    "title": "Landtagswahl 2014 in Brandenburg"
  },
  {
    "occasion_id": "36",
    "type": "Wahl-O-Mat",
    "date": "2015-05-10",
    "territory": "hamburg",
    "wikidata": "Q16054796",
    "extraData": {
      "texts": []
    },
    "num": 32,
    "title": "Bürgerschaftswahl 2015 in Hamburg"
  },
  {
    "occasion_id": 37,
    "type": "Wahl-O-Mat",
    "date": "2002-09-22",
    "territory": "deutschland",
    "wikidata": "Q697167",
    "extraData": {
      "title": "Bundestagswahl",
      "date": "2002-09-22T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Bundestagswahl_2002",
      "data_source": "http://www.spiegel.de/static/wahlomat/"
    },
    "num": 33,
    "title": "Bundestagswahl 2002"
  },
  {
    "occasion_id": 38,
    "type": "Wahl-O-Mat",
    "date": "2016-03-13",
    "territory": "sachsen-anhalt",
    "wikidata": "Q19288815",
    "extraData": {
      "title": "Landtagswahl Sachsen-Anhalt",
      "date": "2016-03-13T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_in_Sachsen-Anhalt_2016",
      "data_source": "https://www.wahl-o-mat.de/sachsenanhalt2016/PositionsvergleichSachsenAnhalt2016.pdf"
    },
    "num": 34,
    "title": "Landtagswahl Sachsen-Anhalt 2016"
  },
  {
    "occasion_id": 39,
    "type": "Wahl-O-Mat",
    "date": "2016-03-13",
    "territory": "baden-wuerttemberg",
    "wikidata": "Q19273524",
    "extraData": {
      "title": "Landtagswahl Baden-Württemberg",
      "date": "2016-03-13T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_in_Baden-W%C3%BCrttemberg_2016",
      "data_source": "https://www.wahl-o-mat.de/bw2016/PositionsvergleichBadenWuerttemberg2016.pdf"
    },
    "num": 35,
    "title": "Landtagswahl Baden-Württemberg 2016"
  },
  {
    "occasion_id": 40,
    "type": "Wahl-O-Mat",
    "date": "2015-05-10",
    "territory": "bremen",
    "wikidata": "Q15905797",
    "extraData": {
      "title": "Bürgerschaftswahl Bremen",
      "date": "2015-05-10T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/B%C3%BCrgerschaftswahl_in_Bremen_2015",
      "data_source": "https://www.wahl-o-mat.de/bremen2015/PositionsvergleichBremen2015.pdf"
    },
    "num": 36,
    "title": "Bürgerschaftswahl Bremen 2015"
  },
  {
    "occasion_id": 41,
    "type": "Wahl-O-Mat",
    "date": "2017-05-07",
    "territory": "schleswig-holstein",
    "wikidata": "Q19962015",
    "extraData": {
      "title": "Landtagswahl Schleswig-Holstein",
      "date": "2017-05-07T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_in_Schleswig-Holstein_2017",
      "data_source": "https://www.wahl-o-mat.de/schleswigholstein2017/PositionsvergleichSchleswigHolstein2017.pdf"
    },
    "num": 37,
    "title": "Landtagswahl Schleswig-Holstein 2017"
  },
  {
    "occasion_id": 42,
    "type": "Wahl-O-Mat",
    "date": "2016-09-18",
    "territory": "berlin",
    "wikidata": "Q19787659",
    "extraData": {
      "title": "Abgeordnetenhauswahl Berlin",
      "date": "2016-09-18T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Wahl_zum_Abgeordnetenhaus_von_Berlin_2016",
      "data_source": "https://www.wahl-o-mat.de/berlin2016/PositionsvergleichBerlin2016.pdf"
    },
    "num": 38,
    "title": "Abgeordnetenhauswahl Berlin 2016"
  },
  {
    "occasion_id": 43,
    "type": "Wahl-O-Mat",
    "date": "2016-03-13",
    "territory": "rheinland-pfalz",
    "wikidata": "Q19288813",
    "extraData": {
      "title": "Landtagswahl Rheinland-Pfalz",
      "date": "2016-03-13T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_in_Rheinland-Pfalz_2016",
      "data_source": "https://www.wahl-o-mat.de/rlp2016/PositionsvergleichRheinlandPfalz2016.pdf"
    },
    "num": 39,
    "title": "Landtagswahl Rheinland-Pfalz 2016"
  },
  {
    "occasion_id": 44,
    "type": "Wahl-O-Mat",
    "date": "2017-03-26",
    "territory": "saarland",
    "wikidata": "Q19818995",
    "extraData": {
      "title": "Landtagswahl Saarland",
      "date": "2017-03-26T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_im_Saarland_2017",
      "data_source": "https://www.wahl-o-mat.de/saarland2017/PositionsvergleichSaarland2017.pdf"
    },
    "num": 40,
    "title": "Landtagswahl Saarland 2017"
  },
  {
    "occasion_id": 45,
    "type": "Wahl-O-Mat",
    "date": "2017-05-14",
    "territory": "nordrhein-westfalen",
    "wikidata": "Q1804132",
    "extraData": {
      "title": "Landtagswahl Nordrhein-Westfalen",
      "date": "2017-05-14T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Landtagswahl_in_Nordrhein-Westfalen_2017",
      "data_source": "https://www.wahl-o-mat.de/nrw2017/PositionsvergleichNordrheinWestfalen2017.pdf"
    },
    "num": 41,
    "title": "Landtagswahl Nordrhein-Westfalen 2017"
  },
  {
    "occasion_id": 46,
    "type": "Wahl-O-Mat",
    "date": "2017-09-24",
    "territory": "deutschland",
    "wikidata": "Q15062956",
    "extraData": {
      "title": "Bundestagswahl",
      "date": "2017-09-24T00:00:00.000Z",
      "info": "https://de.wikipedia.org/wiki/Bundestagswahl_2017",
      "data_source": "https://www.wahl-o-mat.de/bundestagswahl2017/PositionsvergleichBundestagswahl2017.pdf"
    },
    "num": 42,
    "title": "Bundestagswahl 2017"
  }
];

export default function() {
  this.namespace = '/data';

  this.get('/occasions', function() {
    return {
      data: occasions
    };
  });
}
