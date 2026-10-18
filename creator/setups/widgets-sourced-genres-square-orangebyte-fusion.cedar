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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/action-square-fusion.png",
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
          "id": "F30CF147-BB0E-4CB5-988A-D6FA9C4D1969",
          "query": {
            "identifier": "snoak|popular-action-movies",
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
              "id": "E8648C0A-62E6-5AD1-AC6B-C83C00164B13",
              "query": {
                "identifier": "snoak|popular-action-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Action Movies"
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
              "id": "6AB37F4B-9B54-5B16-A843-22A1BC263B50",
              "query": {
                "identifier": "snoak|popular-action-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Action Shows"
            }
          ],
          "tileShape": "square",
          "title": "Action"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/adventure-square-fusion.png",
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
          "id": "6C304D94-D467-4536-A41E-D6E4EABE764E",
          "query": {
            "identifier": "rizreflects|adventures",
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
              "id": "2F3E59B4-08A8-5031-BFC8-2BB6474E4CD7",
              "query": {
                "identifier": "rizreflects|adventures",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Adventures"
            }
          ],
          "tileShape": "square",
          "title": "Adventure"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/anime-square-fusion.png",
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
          "id": "5F67ED86-60DC-4F38-894A-4937183B2FC9",
          "query": {
            "identifier": "snoak|popular-animation-anime-movies",
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
              "id": "AC3BAC7A-F39F-56C1-A9A9-B50B6F28C4BB",
              "query": {
                "identifier": "snoak|popular-animation-anime-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Animation/Anime Movies"
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
              "id": "A97DDBE9-D00F-52C6-B776-3444C45C9A58",
              "query": {
                "identifier": "snoak|popular-animation-anime-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Animation/Anime Shows"
            }
          ],
          "tileShape": "square",
          "title": "Anime"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/comedy-square-fusion.png",
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
          "id": "50D2D80C-7318-4A2A-B234-58D06FC0AB2A",
          "query": {
            "identifier": "snoak|popular-comedy-movies",
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
              "id": "F2D6BB3A-1840-504F-9B9B-7D0F9384F7B5",
              "query": {
                "identifier": "snoak|popular-comedy-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Comedy Movies"
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
              "id": "8A76130F-4790-5334-87F0-76ABABEC7B82",
              "query": {
                "identifier": "snoak|popular-comedy-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Comedy Shows"
            }
          ],
          "tileShape": "square",
          "title": "Comedy"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/crime-square-fusion.png",
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
          "id": "FE4699AD-84E2-44F4-AEEE-C195E711CC21",
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
              "id": "A4DA11E5-7C32-5FC7-BB76-32ECCCAD05AD",
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
              "id": "D10B2830-BEDF-593C-A05D-AFC4E31FC1A2",
              "query": {
                "identifier": "garycrawfordgc|crime-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Crime Shows"
            }
          ],
          "tileShape": "square",
          "title": "Crime"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/documentary-square-fusion.png",
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
          "id": "FC93D4F7-77A1-46C9-A447-C3C880DED7E9",
          "query": {
            "identifier": "snoak|popular-documentary-movies",
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
              "id": "A28084D4-48CD-5C04-AEBF-BA82129778DA",
              "query": {
                "identifier": "snoak|popular-documentary-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Documentary Movies"
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
              "id": "88741163-0E44-5979-B4EF-FEF3213C708F",
              "query": {
                "identifier": "snoak|popular-documentary-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Documentary Shows"
            }
          ],
          "tileShape": "square",
          "title": "Documentary"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/drama-square-fusion.png",
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
          "id": "DCFD4B23-B410-40EF-8229-4D166ACD8F4A",
          "query": {
            "identifier": "snoak|popular-drama-movies",
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
              "id": "93AFB2D8-83EF-591C-98FA-E9C3F151BC92",
              "query": {
                "identifier": "snoak|popular-drama-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Drama Movies"
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
              "id": "CA976431-6122-5831-9021-89C4F0F510A7",
              "query": {
                "identifier": "snoak|popular-drama-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Drama Shows"
            }
          ],
          "tileShape": "square",
          "title": "Drama"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/family-square-fusion.png",
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
          "id": "A1F342FA-0C4E-433C-8040-E07639A7B673",
          "query": {
            "identifier": "rizreflects|family-movies",
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
              "id": "A5885AE3-83A5-5F66-B0D0-F8EC07CA0904",
              "query": {
                "identifier": "rizreflects|family-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Family Movies"
            }
          ],
          "tileShape": "square",
          "title": "Family"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/history-square-fusion.png",
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
          "id": "1614FD83-1D5D-44A4-A557-7D11518AE11E",
          "query": {
            "identifier": "garycrawfordgc|history",
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
              "id": "DF7BCBAC-88C0-54A7-B490-5D68D4C1EF19",
              "query": {
                "identifier": "garycrawfordgc|history",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "History"
            }
          ],
          "tileShape": "square",
          "title": "History"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/horror-square-fusion.png",
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
          "id": "A8F28D39-ED6E-4C13-96B0-C54BF420FC41",
          "query": {
            "identifier": "snoak|popular-horror-movies",
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
              "id": "76E0F33A-0816-578F-AF75-C326CFC5C8B5",
              "query": {
                "identifier": "snoak|popular-horror-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Horror Movies"
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
              "id": "89F69F1B-C4DB-5774-8A76-E60F2EB5E682",
              "query": {
                "identifier": "snoak|popular-horror-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Horror Shows"
            }
          ],
          "tileShape": "square",
          "title": "Horror"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/romance-square-fusion.png",
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
          "id": "4F68497A-AE86-4C0A-8E7E-5FC73AF22DCE",
          "query": {
            "identifier": "snoak|popular-romance-movies",
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
              "id": "BE0723FD-D510-56CC-9813-B17FA823895A",
              "query": {
                "identifier": "snoak|popular-romance-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Romance Movies"
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
              "id": "9A5D5286-121E-5FA1-A2B3-5233DC22DE0F",
              "query": {
                "identifier": "snoak|popular-romance-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Romance Shows"
            }
          ],
          "tileShape": "square",
          "title": "Romance"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/scifi-square-fusion.png",
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
          "id": "B239D502-A515-4B21-950E-79D498236537",
          "query": {
            "identifier": "snoak|popular-sci-fi-movies",
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
              "id": "17713A07-119D-5609-951D-9CF70DDDEFBF",
              "query": {
                "identifier": "snoak|popular-sci-fi-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Sci-Fi Movies"
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
              "id": "F51F0B81-7F62-54AE-9342-3EC34486E1E4",
              "query": {
                "identifier": "snoak|popular-sci-fi-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Sci-Fi Shows"
            }
          ],
          "tileShape": "square",
          "title": "Scifi"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/fusion/thriller-square-fusion.png",
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
          "id": "AD2404A1-9C5A-4A38-8AAD-5670A9906BD7",
          "query": {
            "identifier": "snoak|popular-thriller-movies",
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
              "id": "29A03F5C-ABEC-5A47-86C8-0F4880FDFAB9",
              "query": {
                "identifier": "snoak|popular-thriller-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Thriller Movies"
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
              "id": "562A81C9-56ED-504C-8B7E-8D7A78BDBF9E",
              "query": {
                "identifier": "snoak|popular-thriller-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Popular Thriller Shows"
            }
          ],
          "tileShape": "square",
          "title": "Thriller"
        }
      ],
      "id": "9FA933AA-E528-58C5-9071-566BB0222F60",
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
      "title": "Genres (Fusion)"
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
  "title": "Sourced-Genres-Square-Orangebyte-Fusion"
}
