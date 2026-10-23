{
  "branches": [
    {
      "dataSource": {
        "identifier": "cedar.branch-group",
        "kind": "custom",
        "parameters": {
          "cedar.home.displaysFolderCards": "true",
          "cedar.home.folderRole": "folder",
          "cedar.home.leafBrowseLayout": "chips-and-grid"
        }
      },
      "defaultFilters": {
        "contentType": "both",
        "countryCodes": [],
        "genreIDs": [],
        "networkIDs": [],
        "originalLanguageCodes": [],
        "productionCompanyIDs": [],
        "streamingProviderIDs": []
      },
      "folderOptions": [
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/action-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "B29A5C02-182F-4108-862F-D8EADFA4E662",
          "query": {
            "identifier": "snoak|action-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91211"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "56FF3560-B6CD-5BC3-9E52-266864F7DFCD",
              "query": {
                "identifier": "snoak|action-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91211"
                }
              },
              "title": "Popular Action Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "72B9C910-C977-54C0-A8B3-93331F00D3DA",
              "query": {
                "identifier": "snoak|action-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91213"
                }
              },
              "title": "Popular Action Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Action"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/comedy-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "E14F7496-E812-4D34-A72E-1C5CC8D42146",
          "query": {
            "identifier": "snoak|comedy-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91223"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "9B431186-CCB1-514E-AAF9-04A9EBD05B78",
              "query": {
                "identifier": "snoak|comedy-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91223"
                }
              },
              "title": "Popular Comedy Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "B8876B1D-F8E7-58EB-8F78-79A4B507C785",
              "query": {
                "identifier": "snoak|comedy-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91224"
                }
              },
              "title": "Popular Comedy Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Comedy"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/crime-poster.png",
          "dataSource": {
            "identifier": "trakt-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "F9D34A54-8411-4A9F-BAB4-EAFC7D6247C2",
          "query": {
            "identifier": "garycrawfordgc|crime",
            "kind": "curatedList",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "trakt-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "FDCF18FD-EA47-5F4F-8F1C-5C41A307F325",
              "query": {
                "identifier": "garycrawfordgc|crime",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Crime"
            },
            {
              "dataSource": {
                "identifier": "trakt-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "6CDBDE40-5C3A-52D4-99BF-F6A7BF993A4A",
              "query": {
                "identifier": "garycrawfordgc|crime-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Crime Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Crime"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/drama-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "BC760257-6892-46B4-BD89-3B0EC910C5C1",
          "query": {
            "identifier": "snoak|drama-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91296"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "82153842-979E-5283-BD82-E2727F53ED65",
              "query": {
                "identifier": "snoak|drama-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91296"
                }
              },
              "title": "Popular Drama Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "6AE78598-A2C9-5980-9B9A-F5E33BEA28B2",
              "query": {
                "identifier": "snoak|drama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91297"
                }
              },
              "title": "Popular Drama Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Drama"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/fantasy-poster.png",
          "dataSource": {
            "identifier": "trakt-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "AD8B5DBC-B4FC-45F3-A7F7-8F9840DB7505",
          "query": {
            "identifier": "rizreflects|fantasy-movies",
            "kind": "curatedList",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "trakt-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "423EEE88-42CB-57F9-9278-12D21D0380BB",
              "query": {
                "identifier": "rizreflects|fantasy-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Fantasy Movies"
            }
          ],
          "tileShape": "poster",
          "title": "Fantasy"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/horror-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "8915E1E4-70C6-45BE-8EC1-59B35B0750CC",
          "query": {
            "identifier": "snoak|horror-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91215"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "1A9033C9-B980-5CA2-B2C9-1456622EE544",
              "query": {
                "identifier": "snoak|horror-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91215"
                }
              },
              "title": "Popular Horror Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "6ECE82BD-DF1B-52F7-AEAC-B618FA1064B9",
              "query": {
                "identifier": "snoak|horror-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91217"
                }
              },
              "title": "Popular Horror Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Horror"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/kids-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "8D0239B8-FD00-43CA-8FF5-E13AC3C4ED22",
          "query": {
            "identifier": "snoak|trending-kids-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88467"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "45617807-5DFF-5034-8A73-A409E11DC292",
              "query": {
                "identifier": "snoak|trending-kids-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88467"
                }
              },
              "title": "Trending Kids Movies"
            },
            {
              "dataSource": {
                "identifier": "trakt-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "1120AF62-CDBC-5214-B739-C2586D794FD6",
              "query": {
                "identifier": "tvgeniekodi|trending-kids-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Trending Kids Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Kids"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/romance-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "56375853-3037-4DCD-BC1C-6422E0DBA74D",
          "query": {
            "identifier": "snoak|popular-romance-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "128262"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "E5AC463F-2986-59BC-BF81-177500ADBE32",
              "query": {
                "identifier": "snoak|popular-romance-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128262"
                }
              },
              "title": "Popular Romance Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "E70CA2C2-855D-5F51-A084-3AA0395C8747",
              "query": {
                "identifier": "snoak|popular-romance-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128265"
                }
              },
              "title": "Popular Romance Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Romance"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/scifi-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "44050D12-24F6-4D74-8FEE-A9E913E0E567",
          "query": {
            "identifier": "snoak|science-fiction-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91220"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "4BD16725-0455-563B-9383-C7B3EC04975D",
              "query": {
                "identifier": "snoak|science-fiction-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91220"
                }
              },
              "title": "Popular Sci-Fi Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "5858722D-491E-52D8-B13F-2C7A12E2092A",
              "query": {
                "identifier": "snoak|science-fiction-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91221"
                }
              },
              "title": "Popular Sci-Fi Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Scifi"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/poster/mousa.a/thriller-poster.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "both",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "3CFF5562-2419-4560-8010-EC629C5C6C22",
          "query": {
            "identifier": "snoak|thriller-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "91893"
            }
          },
          "sources": [
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "DF875286-0728-581E-A3B5-320078E6EC54",
              "query": {
                "identifier": "snoak|thriller-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91893"
                }
              },
              "title": "Popular Thriller Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "FC02EF80-51E1-5C3B-A397-3E399C51DA49",
              "query": {
                "identifier": "snoak|thriller-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91894"
                }
              },
              "title": "Popular Thriller Shows"
            }
          ],
          "tileShape": "poster",
          "title": "Thriller"
        }
      ],
      "id": "9537E837-D3DA-5DFF-9BB1-DD0E3F92BE53",
      "isEnabled": true,
      "position": 0,
      "presentation": {
        "enhancedPostersEnabled": false,
        "ratings": {
          "isEnabled": false,
          "providerIDs": []
        },
        "templateID": "wide-backdrop-carousel"
      },
      "profileID": "00000000-0000-0000-0000-000000000000",
      "query": {
        "kind": "custom",
        "identifier": "cedar.branch-group",
        "parameters": {}
      },
      "schemaVersion": 2,
      "title": "Genres"
    }
  ],
  "bundleID": "EEF15CF5-D85F-422E-8F05-E647A430BCAB",
  "createdAt": "2026-10-11T14:18:03Z",
  "formatIdentifier": "app.cedar.bundle",
  "generator": {
    "application": "Cedar Creator"
  },
  "kind": "branches",
  "schemaVersion": 1,
  "title": "Genres (Poster)"
}
