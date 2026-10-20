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
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/appletv-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "350"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "84EC7513-1E56-4032-9D66-2A74DF2F4B2B",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "350"
                ],
                "sortOrder": "popularity"
              },
              "id": "099A0A9B-8FE6-5920-AEF5-E36845286962",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Apple TV+ Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "350"
                ],
                "sortOrder": "popularity"
              },
              "id": "343E0270-860D-590D-B588-F2C76C1D65B7",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Apple TV+ Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Appletv"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/crunchyroll-wide-tinted.png",
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
          "id": "F2439FEC-FAB3-4F99-A15E-35C7E66F8682",
          "query": {
            "identifier": "Frostypolicia|crunchyroll-movies",
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
              "id": "96AA41EE-4607-5AB0-AA8F-4261C1CE6F4A",
              "query": {
                "identifier": "Frostypolicia|crunchyroll-movies",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Crunchyroll - Movies"
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
              "id": "D8023B23-45FF-5D9D-8AED-D99329C3EBBF",
              "query": {
                "identifier": "Frostypolicia|crunchyroll-shows",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Crunchyroll - Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Crunchyroll"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/discoveryplus-wide-tinted.png",
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
          "id": "1A5BDD56-E7DB-42C0-869B-59F24FF7DF85",
          "query": {
            "identifier": "moviemankev79|discovery",
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
              "id": "9AD5C5A2-92F4-5686-BEA2-041EE3CCA0D8",
              "query": {
                "identifier": "moviemankev79|discovery",
                "kind": "curatedList",
                "parameters": {}
              },
              "title": "Discovery+"
            }
          ],
          "tileShape": "landscape",
          "title": "Discoveryplus"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/disney-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "337"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "4A937ECC-2794-4BC6-8326-9B9FD8D457B2",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "337"
                ],
                "sortOrder": "popularity"
              },
              "id": "18FFC929-C25A-5B77-99E3-21AAC3F2AEF1",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Disney+ Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "337"
                ],
                "sortOrder": "popularity"
              },
              "id": "BE476698-F974-54BC-9671-280D4A52E6B6",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Disney+ Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Disney"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/hbomax-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "1899",
              "1825"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "4E018798-ABB7-4729-B82E-62F0ED04C6B4",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "1899",
                  "1825"
                ],
                "sortOrder": "popularity"
              },
              "id": "9E40B4A0-D8B7-5E13-8660-6251F094740D",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top HBO Max Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "1899",
                  "1825"
                ],
                "sortOrder": "popularity"
              },
              "id": "D4F406ED-4BA7-5C50-B75E-83FF37A3671A",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top HBO Max Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Hbomax"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/kdramaplus-wide-tinted.png",
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
          "id": "4DEE8DE2-8CC7-4C39-93BE-5C0614E6302A",
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
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "1F55B70E-82B9-56A2-BC75-90786E647478",
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
                "contentType": "both",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": []
              },
              "id": "1955CF8C-985C-50F7-8588-0E44AABCCA85",
              "query": {
                "identifier": "snoak|popular-kdrama-shows",
                "kind": "curatedList",
                "parameters": {
                  "listID": "130775"
                }
              },
              "title": "Popular KDrama Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Kdramaplus"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/netflixdark-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "8",
              "1796"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "47E486A2-4F34-4F64-8D23-CFE6E4CB4268",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "8",
                  "1796"
                ],
                "sortOrder": "popularity"
              },
              "id": "88DABD80-5328-58EB-AF22-578DB81A6465",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Netflix Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "8",
                  "1796"
                ],
                "sortOrder": "popularity"
              },
              "id": "E9A1DCDB-D82B-5508-B0FB-BD12608855B2",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Netflix Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Netflixdark"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/netflixred-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "8",
              "1796"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "7CAAB902-6830-4A76-B5C0-25E2DC229D91",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "8",
                  "1796"
                ],
                "sortOrder": "popularity"
              },
              "id": "349305AD-3E63-58E0-BDF8-4026E4833D06",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Netflix Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "8",
                  "1796"
                ],
                "sortOrder": "popularity"
              },
              "id": "56C72479-A016-5BCD-BA1C-8FECBCBD4843",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Netflix Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Netflixred"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/paramount-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "2303"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "3E4B2F6F-35B9-487C-896F-BC87EDC891CD",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "2303"
                ],
                "sortOrder": "popularity"
              },
              "id": "CBBA9A08-5D43-5558-BD84-9062D28C35FA",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Paramount+ Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "2303"
                ],
                "sortOrder": "popularity"
              },
              "id": "A289F31A-FA81-5965-A5E4-C9E3A1C1D32F",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Paramount+ Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Paramount"
        },
        {
          "coverImageURL": "https://raw.githubusercontent.com/itsrenoria/fusion-starter-kit/refs/heads/main/resources/widgets/streaming/wide/rdnoni/tinted/primevideo-wide-tinted.png",
          "dataSource": {
            "kind": "preferredMetadata",
            "parameters": {}
          },
          "filters": {
            "contentType": "movies",
            "countryCodes": [],
            "genreIDs": [],
            "networkIDs": [],
            "originalLanguageCodes": [],
            "productionCompanyIDs": [],
            "streamingProviderIDs": [
              "9",
              "2100"
            ],
            "sortOrder": "popularity"
          },
          "hidesTitle": true,
          "id": "65143B14-C7C4-4811-B3FA-7ACE358B07E0",
          "query": {
            "kind": "popular",
            "parameters": {}
          },
          "sources": [
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "movies",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "9",
                  "2100"
                ],
                "sortOrder": "popularity"
              },
              "id": "48451130-48FF-5D27-83EE-FE594D1F648D",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Amazon Prime Movies"
            },
            {
              "dataSource": {
                "kind": "preferredMetadata",
                "parameters": {}
              },
              "filters": {
                "contentType": "shows",
                "countryCodes": [],
                "genreIDs": [],
                "networkIDs": [],
                "originalLanguageCodes": [],
                "productionCompanyIDs": [],
                "streamingProviderIDs": [
                  "9",
                  "2100"
                ],
                "sortOrder": "popularity"
              },
              "id": "730BAE95-0036-512C-8C69-67D0275F749A",
              "query": {
                "kind": "popular",
                "parameters": {}
              },
              "title": "Top Amazon Prime Shows"
            }
          ],
          "tileShape": "landscape",
          "title": "Primevideo"
        }
      ],
      "id": "2225AE42-98EB-5421-ADD0-1C83FB5D4836",
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
  "title": "Streaming Services (Tinted)"
}
