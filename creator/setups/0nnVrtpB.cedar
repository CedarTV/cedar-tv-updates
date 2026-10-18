{
  "branches": [
    {
      "dataSource": {
        "identifier": "cedar.branch-group",
        "kind": "custom",
        "parameters": {
          "cedar.home.displaysFolderCards": "true",
          "cedar.home.folderRole": "folder",
          "cedar.home.leafBrowseLayout": "rows"
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
          "coverImageURL": "https://i.postimg.cc/kgkTFbtw/Netflix.png",
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
          "id": "D52E1363-9C93-4136-88D8-CDA892DCF93D",
          "query": {
            "identifier": "tvgeniekodi|netflix-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88328"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|netflix-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88328"
                }
              },
              "title": "Netflix Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|netflix-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88329"
                }
              },
              "title": "Netflix Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-netflix-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86752"
                }
              },
              "title": "Latest Netflix Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-netflix-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86751"
                }
              },
              "title": "Latest Netflix Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Netflix"
        },
        {
          "coverImageURL": "https://i.postimg.cc/dVz5myTz/Prime.png",
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
          "id": "8D9B05C0-7DAA-4D87-BBD0-4FFE88F6A1F4",
          "query": {
            "identifier": "tvgeniekodi|prime-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88332"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|prime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88332"
                }
              },
              "title": "Prime Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|prime-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88333"
                }
              },
              "title": "Prime Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-amazon-prime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86755"
                }
              },
              "title": "Latest Amazon Prime Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-amazon-prime-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86753"
                }
              },
              "title": "Latest Amazon Prime Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Prime "
        },
        {
          "coverImageURL": "https://i.postimg.cc/W1Q56kJB/Disney.png",
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
          "id": "3CBDA712-CDFC-49D8-ABFA-77B949CEBA80",
          "query": {
            "identifier": "tvgeniekodi|disney-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88322"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|disney-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88322"
                }
              },
              "title": "Disney+ Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|disney-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88323"
                }
              },
              "title": "Disney+ Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-disney-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86759"
                }
              },
              "title": "Latest Disney+ Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-disney-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86758"
                }
              },
              "title": "Latest Disney+ Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Disney+"
        },
        {
          "coverImageURL": "https://i.postimg.cc/cLVFMn8X/HBO-Max.png",
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
          "id": "1C899BDE-CBAB-4E55-9814-031F61CF96F6",
          "query": {
            "identifier": "tvgeniekodi|max-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88324"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|max-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88324"
                }
              },
              "title": "Max Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|max-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88325"
                }
              },
              "title": "Max Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-hbo-max-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "89647"
                }
              },
              "title": "Latest HBO Max Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-hbo-max-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "89649"
                }
              },
              "title": "Latest HBO Max Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "HBO Max "
        },
        {
          "coverImageURL": "https://i.postimg.cc/4xrWb9hS/Apple-TV.png",
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
          "id": "60515917-691A-4709-B5A3-4988F60DC1CC",
          "query": {
            "identifier": "tvgeniekodi|apple-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88317"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|apple-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88317"
                }
              },
              "title": "Apple+ Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|apple-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88319"
                }
              },
              "title": "Apple+ Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-apple-tv-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86757"
                }
              },
              "title": "Latest Apple TV+ Movies"
            }
          ],
          "tileShape": "landscape",
          "title": "Apple TV"
        },
        {
          "coverImageURL": "https://i.postimg.cc/RZjgQHn8/Paramount.png",
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
          "id": "2E27317A-B9AD-4E71-A732-EC650358D8D9",
          "query": {
            "identifier": "tvgeniekodi|paramount-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88330"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|paramount-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88330"
                }
              },
              "title": "Paramount+ Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|paramount-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88331"
                }
              },
              "title": "Paramount+ Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-paramount-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86762"
                }
              },
              "title": "Latest Paramount+ Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-paramount-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "86761"
                }
              },
              "title": "Latest Paramount+ Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Paramount+"
        },
        {
          "coverImageURL": "https://i.postimg.cc/CxWcHqfv/Hulu.png",
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
          "id": "0B73C0DD-3766-4B38-B529-001512202685",
          "query": {
            "identifier": "tvgeniekodi|hulu-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "88326"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "tvgeniekodi|hulu-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88326"
                }
              },
              "title": "Hulu Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "tvgeniekodi|hulu-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88327"
                }
              },
              "title": "Hulu Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Hulu"
        },
        {
          "coverImageURL": "https://i.postimg.cc/P5BSzw89/Peacock.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "BE30735D-8C10-4544-828A-5884A22B0E3F",
          "query": {
            "identifier": "alaxkouad|peacock-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "84239"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "alaxkouad|peacock-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "84239"
                }
              },
              "title": "Peacock Movies"
            }
          ],
          "tileShape": "landscape",
          "title": "Peacock"
        },
        {
          "coverImageURL": "https://i.postimg.cc/Hkf64y7P/Crunchyroll.png",
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
          "id": "408B810B-FA05-411E-9F92-9327C506F6C6",
          "query": {
            "identifier": "frostypolicia|crunchyroll-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "98862"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "frostypolicia|crunchyroll-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "98862"
                }
              },
              "title": "Crunchyroll - Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "frostypolicia|crunchyroll-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "99202"
                }
              },
              "title": "Crunchyroll - Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Crunchyroll"
        }
      ],
      "id": "9D29D195-A8D9-5F24-BD50-8805E7BDBF6F",
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
      "title": "Streaming Services"
    },
    {
      "dataSource": {
        "identifier": "cedar.branch-group",
        "kind": "custom",
        "parameters": {
          "cedar.home.displaysFolderCards": "true",
          "cedar.home.folderRole": "folder",
          "cedar.home.leafBrowseLayout": "rows"
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
          "coverImageURL": "https://i.postimg.cc/QCk2vqct/ACTION.png",
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
          "id": "8BEA6BC6-7E0F-4A34-969F-D56C88D2086E",
          "query": {
            "identifier": "snoak|popular-action-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-action-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-action-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91213"
                }
              },
              "title": "Popular Action Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|action-movies-top-rated-from-1980-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2407"
                }
              },
              "title": "Action Movies (Top Rated From 1980 to Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-action-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128037"
                }
              },
              "title": "Latest Action Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-action-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128029"
                }
              },
              "title": "Latest Action Shows"
            }
          ],
          "tileShape": "square",
          "title": "Action"
        },
        {
          "coverImageURL": "https://i.postimg.cc/QCk2vqcC/ANIMATION.png",
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
          "id": "27AE7DC7-95CB-48E9-AA08-9EFAAEAA85DB",
          "query": {
            "identifier": "snoak|popular-animated-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "116037"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-animated-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "116037"
                }
              },
              "title": "Popular Animated Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-animated-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "116038"
                }
              },
              "title": "Popular Animated Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-animated-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128035"
                }
              },
              "title": "Latest Animated Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-animated-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128034"
                }
              },
              "title": "Latest Animated Shows"
            }
          ],
          "tileShape": "square",
          "title": "Animation"
        },
        {
          "coverImageURL": "https://i.postimg.cc/NFchNn2v/ANIME.png",
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
          "id": "338E5246-6369-4264-A5D2-358AC09C6033",
          "query": {
            "identifier": "wblandtv|popular-anime-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "104289"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "wblandtv|popular-anime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "104289"
                }
              },
              "title": "Popular Anime Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "wblandtv|popular-anime-series",
                "kind": "curatedList",
                "parameters": {
                  "listID": "105461"
                }
              },
              "title": "Popular Anime Series"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|trending-anime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88468"
                }
              },
              "title": "Trending Anime Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|trending-anime-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "88469"
                }
              },
              "title": "Trending Anime Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "iamscallywag|latest-anime-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2483"
                }
              },
              "title": "Latest Anime Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-6",
              "query": {
                "identifier": "iamscallywag|latest-anime",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2472"
                }
              },
              "title": "Latest Anime"
            }
          ],
          "tileShape": "square",
          "title": "Anime"
        },
        {
          "coverImageURL": "https://i.postimg.cc/6qLkFhCp/COMEDY.png",
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
          "id": "D3293B34-E581-44B2-959E-5E9E40FD6277",
          "query": {
            "identifier": "snoak|popular-comedy-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-comedy-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-comedy-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91224"
                }
              },
              "title": "Popular Comedy Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|comedy-movies-top-rated-from-1960-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2195"
                }
              },
              "title": "Comedy Movies (Top Rated From 1960 To Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-comedy-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128040"
                }
              },
              "title": "Latest Comedy Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-comedy-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128041"
                }
              },
              "title": "Latest Comedy Shows"
            }
          ],
          "tileShape": "square",
          "title": "Comedy"
        },
        {
          "coverImageURL": "https://i.postimg.cc/7hMFjNSY/DOCUMENTARY.png",
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
          "id": "DD46687C-59A1-4780-B769-B952862C029E",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-documentary-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128052"
                }
              },
              "title": "Popular Documentary Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|documentary-movies-top-rated-from-1980-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2406"
                }
              },
              "title": "Documentary Movies (Top Rated From 1980 to Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "bobnimbo|top-documentary-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "78412"
                }
              },
              "title": "Top Documentary Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-documentary-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128027"
                }
              },
              "title": "Latest Documentary Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-6",
              "query": {
                "identifier": "snoak|latest-documentary-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128028"
                }
              },
              "title": "Latest Documentary Shows"
            }
          ],
          "tileShape": "square",
          "title": "Documentary"
        },
        {
          "coverImageURL": "https://i.postimg.cc/tJtK8zFX/DRAMA.png",
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
          "id": "096953F6-CCA6-46D9-9C7C-1B5F1A486933",
          "query": {
            "identifier": "snoak|popular-drama-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-drama-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-drama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91297"
                }
              },
              "title": "Popular Drama Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "binkatl|top-drama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "45766"
                }
              },
              "title": "Top Drama Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "snoak|latest-drama-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128043"
                }
              },
              "title": "Latest Drama Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-drama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128044"
                }
              },
              "title": "Latest Drama Shows"
            }
          ],
          "tileShape": "square",
          "title": "Drama"
        },
        {
          "coverImageURL": "https://i.postimg.cc/vTLJCv5G/FAMILY.png",
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
          "id": "47AFA432-2A62-44D1-BA1A-9CE78D9F854D",
          "query": {
            "identifier": "ranrandwk|popular-family-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "24262"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "ranrandwk|popular-family-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "24262"
                }
              },
              "title": "Popular Family Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "jefland|popular-family-series",
                "kind": "curatedList",
                "parameters": {
                  "listID": "147641"
                }
              },
              "title": "Popular Family Series"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|family-movies-top-rated-from-1980-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2415"
                }
              },
              "title": "Family Movies (Top Rated From 1980 to Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "barfam|new-family-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "59967"
                }
              },
              "title": "New Family Shows"
            }
          ],
          "tileShape": "square",
          "title": "Family"
        },
        {
          "coverImageURL": "https://i.postimg.cc/D0d9Rc1k/HORROR.png",
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
          "id": "76517CA0-4E33-45A9-8F61-CA8524E845AE",
          "query": {
            "identifier": "snoak|popular-horror-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-horror-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-horror-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91217"
                }
              },
              "title": "Popular Horror Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|horror-movies-top-rated-from-1960-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2410"
                }
              },
              "title": "Horror Movies (Top Rated From 1960 to Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "toothmaniac|top-horror-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "10665"
                }
              },
              "title": "Top Horror Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-horror-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128045"
                }
              },
              "title": "Latest Horror Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-6",
              "query": {
                "identifier": "snoak|latest-horror-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128046"
                }
              },
              "title": "Latest Horror Shows"
            }
          ],
          "tileShape": "square",
          "title": "Horror"
        },
        {
          "coverImageURL": "https://i.postimg.cc/rsCB795L/KOREAN.png",
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
          "id": "EA519EF8-2829-4CB3-96E3-B7BB5144DFC3",
          "query": {
            "identifier": "snoak|popular-kdrama-movies",
            "kind": "curatedList",
            "parameters": {
              "listID": "130778"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-kdrama-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "130778"
                }
              },
              "title": "Popular KDrama Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-kdrama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "130775"
                }
              },
              "title": "Popular KDrama Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "epicnick356|top-korean-movies-168",
                "kind": "curatedList",
                "parameters": {
                  "listID": "150310"
                }
              },
              "title": "Top korean movies (168)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "saltydude|top-rated-korean-tv-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "3584"
                }
              },
              "title": "Top Rated Korean TV Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-kdrama-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "130779"
                }
              },
              "title": "Latest KDrama Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-6",
              "query": {
                "identifier": "snoak|latest-kdrama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "130777"
                }
              },
              "title": "Latest KDrama Shows"
            }
          ],
          "tileShape": "square",
          "title": "Korean"
        },
        {
          "coverImageURL": "https://i.postimg.cc/qqXPWG2f/MYSTERY.png",
          "dataSource": {
            "identifier": "mdblist-public",
            "kind": "trackingService",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": []
          },
          "hidesTitle": true,
          "id": "39091B75-65E2-49C8-8841-03707DD024C3",
          "query": {
            "identifier": "hdlists|mystery-movies-top-rated-from-1980-to-today",
            "kind": "curatedList",
            "parameters": {
              "listID": "2416"
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "hdlists|mystery-movies-top-rated-from-1980-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2416"
                }
              },
              "title": "Mystery Movies (Top Rated From 1980 to Today)"
            }
          ],
          "tileShape": "square",
          "title": "Mystery"
        },
        {
          "coverImageURL": "https://i.postimg.cc/Y0f5TxYV/ROMANCE.png",
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
          "id": "8EE30569-8A0B-4506-A54E-368ACF5733FE",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|latest-romance-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128261"
                }
              },
              "title": "Latest Romance Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-romance-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128264"
                }
              },
              "title": "Latest Romance Shows"
            }
          ],
          "tileShape": "square",
          "title": "Romance"
        },
        {
          "coverImageURL": "https://i.postimg.cc/hvbkN0T5/SCI-FI.png",
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
          "id": "558F2956-84FE-49D0-8CD8-33839F2DF374",
          "query": {
            "identifier": "snoak|popular-sci-fi-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-sci-fi-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-sci-fi-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91221"
                }
              },
              "title": "Popular Sci-Fi Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "hdlists|fantasy-sci-fi-movies-top-rated-from-1980-to-today",
                "kind": "curatedList",
                "parameters": {
                  "listID": "2412"
                }
              },
              "title": "Fantasy/Sci-Fi Movies (Top Rated From 1980 to Today)"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-4",
              "query": {
                "identifier": "darthdobber|top-sci-fi-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "79476"
                }
              },
              "title": "Top Sci-Fi Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-5",
              "query": {
                "identifier": "snoak|latest-sci-fi-movies",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128047"
                }
              },
              "title": "Latest Sci-Fi Movies"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-6",
              "query": {
                "identifier": "snoak|latest-sci-fi-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128048"
                }
              },
              "title": "Latest Sci-Fi Shows"
            }
          ],
          "tileShape": "square",
          "title": "Sci-Fi"
        },
        {
          "coverImageURL": "https://i.postimg.cc/gjW9M7Lp/THRILLER.png",
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
          "id": "ED3DE645-213C-4A08-93F8-9817FBF00B53",
          "query": {
            "identifier": "snoak|popular-thriller-movies",
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
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-1",
              "query": {
                "identifier": "snoak|popular-thriller-movies",
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
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-2",
              "query": {
                "identifier": "snoak|popular-thriller-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "91894"
                }
              },
              "title": "Popular Thriller Shows"
            },
            {
              "dataSource": {
                "identifier": "mdblist-public",
                "kind": "trackingService",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "source-3",
              "query": {
                "identifier": "snoak|latest-thriller-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "128050"
                }
              },
              "title": "Latest Thriller Shows"
            }
          ],
          "tileShape": "square",
          "title": "Thriller"
        }
      ],
      "id": "9F89C78A-79B3-5DE3-B452-FC525D4506D6",
      "isEnabled": true,
      "position": 1,
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
  "createdAt": "2026-10-11T14:18:02Z",
  "formatIdentifier": "app.cedar.bundle",
  "generator": {
    "application": "Cedar Creator"
  },
  "kind": "branches",
  "schemaVersion": 1,
  "title": "Black and White"
}
