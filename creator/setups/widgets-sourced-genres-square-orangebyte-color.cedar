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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/action-square-color.png",
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
          "id": "91975E20-5580-4F5E-8602-6BFF000EC74A",
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
              "id": "F69BA5D1-A8A5-55B2-A27A-BBE5FBC63354",
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
              "id": "5864C7E6-7821-51C7-86D6-99C2ABEBF749",
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
          "tileShape": "square",
          "title": "Action"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/adventure-square-color.png",
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
          "id": "0CC44A1E-C345-4E5C-A78E-CB057B8F7557",
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
              "id": "AC0CCEB6-B81D-51EB-9226-1F30DF615DA1",
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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/anime-square-color.png",
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
          "id": "B435D95D-645B-4AFC-8E15-DC4A4E963958",
          "query": {
            "identifier": "snoak|animationanime-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "121922"
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
              "id": "76C97AEF-8502-5D16-89AF-E8F56E972BD0",
              "query": {
                "identifier": "snoak|animationanime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "121922"
                }
              },
              "title": "Popular Animation/Anime Movies"
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
              "id": "FD5FF867-39A8-5713-B3B2-8D303F8D2A3D",
              "query": {
                "identifier": "snoak|animationanime-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "121921"
                }
              },
              "title": "Popular Animation/Anime Shows"
            }
          ],
          "tileShape": "square",
          "title": "Anime"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/comedy-square-color.png",
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
          "id": "9CB050DD-FD72-460C-96B4-2DFFC0635A20",
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
              "id": "F56B9C4D-0D8C-569F-9492-94FD4EC9FA59",
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
              "id": "65755EC6-17EF-5B44-AAC9-84A73266CBBE",
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
          "tileShape": "square",
          "title": "Comedy"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/documentary-square-color.png",
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
          "id": "F3A4844C-0DA2-4EC9-BB22-C124BEC4CD8F",
          "query": {
            "identifier": "snoak|popular-documentary-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "128051"
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
              "id": "12EFCC1D-8F0B-5461-82A0-4E4556804AA3",
              "query": {
                "identifier": "snoak|popular-documentary-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128051"
                }
              },
              "title": "Popular Documentary Movies"
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
              "id": "C423371A-AB80-51E6-ABA5-3EEECF371E20",
              "query": {
                "identifier": "snoak|popular-documentary-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128052"
                }
              },
              "title": "Popular Documentary Shows"
            }
          ],
          "tileShape": "square",
          "title": "Documentary"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/drama-square-color.png",
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
          "id": "0DAA04B1-1A7F-40B5-BD1F-977A3D9D29AF",
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
              "id": "A3AA2A16-FD32-5B5F-9148-F928AC1F23E5",
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
              "id": "3F5F6353-A1E5-5104-ABC5-6284E745D832",
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
          "tileShape": "square",
          "title": "Drama"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/family-square-color.png",
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
          "id": "5116F46A-B01F-490C-B92C-DA8E68AB4600",
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
              "id": "863F61F6-43DA-592D-9EFF-2D2437C09653",
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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/history-square-color.png",
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
          "id": "3478C561-A373-4306-BD20-68BC2CC283EA",
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
              "id": "F72BAD6B-C28F-514D-983F-05FD7342DB6F",
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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/horror-square-color.png",
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
          "id": "3229FBE5-CFB4-4277-815F-DD136B60E6F8",
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
              "id": "FB16A01E-EC04-570A-A39A-9595E3B740E8",
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
              "id": "5EC670E2-4F5F-5D7F-99E1-589732A00F75",
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
          "tileShape": "square",
          "title": "Horror"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/nature-square-color.png",
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
          "id": "9C2DE350-A3ED-455E-88C5-C6CB7743E165",
          "query": {
            "identifier": "tvgeniekodi|top-nature-shows",
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
              "id": "EC9E9902-D453-599E-AC15-2D7C07444E44",
              "query": {
                "identifier": "tvgeniekodi|top-nature-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Top Nature Shows"
            }
          ],
          "tileShape": "square",
          "title": "Nature"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/reality-square-color.png",
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
          "id": "9AB3DAB0-8FFC-486A-8FCD-C6C131947E72",
          "query": {
            "identifier": "snoak|top-reality-shows",
            "kind": "curatedList",
            "parameters": {
              "listID": "128054"
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
              "id": "3A70AE6A-39B7-525F-97F3-701FC7B33FA1",
              "query": {
                "identifier": "snoak|top-reality-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128054"
                }
              },
              "title": "Popular Reality Shows"
            }
          ],
          "tileShape": "square",
          "title": "Reality"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/romance-square-color.png",
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
          "id": "C6B142CD-AAD7-4FCC-836A-2033B7DF03C3",
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
              "id": "BDC92AA0-E8E1-5107-B8CC-92025FABA495",
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
              "id": "9B0ABD13-3154-520C-97B9-1246FB6636E2",
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
          "tileShape": "square",
          "title": "Romance"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/scifi-square-color.png",
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
          "id": "414D6FC2-1F76-46F7-A028-E49F35947B83",
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
              "id": "9F3F8C49-7122-5A16-83C9-EBC3968B7FD4",
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
              "id": "61EFE9BA-FFF0-5613-AE73-2CB3E13E38C9",
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
          "tileShape": "square",
          "title": "Scifi"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/genres/square/orangebyte/color/thriller-square-color.png",
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
          "id": "92DBA372-72CB-4FFF-8AEE-521C71025B52",
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
              "id": "0B03782B-0195-5454-BD6A-96ADAA763C36",
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
              "id": "800237E9-ABEF-5249-AF13-180979C0EB33",
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
          "tileShape": "square",
          "title": "Thriller"
        }
      ],
      "id": "6E44A612-0652-58CC-BE1B-30C83D8CC728",
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
  "title": "Genres (Color)"
}
