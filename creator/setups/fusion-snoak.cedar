{
  "branches" : [
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "0498B8A2-29DD-5F88-B95F-F2720EDA9E8E",
      "isEnabled" : true,
      "position" : 0,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|today-s-most-popular-movies-on-justwatch",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Today's Most Popular Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "DC0E8B87-1D1D-54BB-A21C-0E4B1AECBC29",
      "isEnabled" : true,
      "position" : 1,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|today-s-most-popular-shows-on-justwatch",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Today's Most Popular Shows"
    },
    {
      "dataSource" : {
        "identifier" : "cedar.branch-group",
        "kind" : "custom",
        "parameters" : {
          "cedar.home.displaysFolderCards" : "true",
          "cedar.home.folderRole" : "folder",
          "cedar.home.leafBrowseLayout" : "chips-and-grid"
        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/vH9k7TLG\/watchlist.png",
          "dataSource" : {
            "identifier" : "trakt",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "148cb5bf-ae71-40c1-980d-942805dd9e92",
          "query" : {
            "identifier" : "builtin:watchlist",
            "kind" : "curatedList",
            "parameters" : {
              "accountBinding" : "current",
              "connectedList" : "1"
            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "9E2C9FFE-7F90-50F0-8229-8A2B23954BFA",
              "query" : {
                "identifier" : "builtin:watchlist",
                "kind" : "curatedList",
                "parameters" : {
                  "accountBinding" : "current",
                  "connectedList" : "1"
                }
              },
              "title" : "Watchlist"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Watchlist"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/gkHRm77c\/trending-movies.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "434c98a3-ceb5-48d8-a9b3-06bd5d278594",
          "query" : {
            "identifier" : "snoak|trakt-s-trending-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "2A2CBEC0-F01C-5009-AB64-8F3206DF2AE3",
              "query" : {
                "identifier" : "snoak|trakt-s-trending-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Trakt's Trending Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Trending Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/nhVmzk8c\/trending-shows.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "4fbc85c9-79cf-4b94-a2aa-7cce17888124",
          "query" : {
            "identifier" : "snoak|trakt-s-trending-shows",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "56C2D032-7859-561F-84FF-B6CCA672C0BD",
              "query" : {
                "identifier" : "snoak|trakt-s-trending-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Trakt's Trending Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Trending Shows"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/sD4SsLLj\/latest-movies.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "fb5c8586-d4c9-471d-ab66-10a73ce80433",
          "query" : {
            "identifier" : "snoak|latest-streaming-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "32242CB3-4BB1-5A22-A3DA-8DF188F521A8",
              "query" : {
                "identifier" : "snoak|latest-streaming-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Streaming Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Latest Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/TYJmfssR\/latest-shows.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "0c54e7f6-4363-4120-b86d-3e1a243db378",
          "query" : {
            "identifier" : "snoak|latest-shows",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "58CB5120-154E-55D2-A336-A9C3EF3C0050",
              "query" : {
                "identifier" : "snoak|latest-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Latest Shows"
        }
      ],
      "id" : "24463C71-CBCB-57F2-8DCB-30EB0FEA6163",
      "isEnabled" : true,
      "position" : 2,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "wide-backdrop-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "builtin:watchlist",
        "kind" : "curatedList",
        "parameters" : {
          "accountBinding" : "current",
          "connectedList" : "1"
        }
      },
      "schemaVersion" : 2,
      "title" : "Discover"
    },
    {
      "dataSource" : {
        "identifier" : "cedar.branch-group",
        "kind" : "custom",
        "parameters" : {
          "cedar.home.displaysFolderCards" : "true",
          "cedar.home.folderRole" : "folder",
          "cedar.home.leafBrowseLayout" : "chips-and-grid"
        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/3R9D8yrK\/netflix.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "cbb658e2-ae39-4d51-b3fa-afadc21d0aa4",
          "query" : {
            "identifier" : "snoak|latest-netflix-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "2BE8754B-A2D1-5A87-83B3-55A39A4CF8BD",
              "query" : {
                "identifier" : "snoak|latest-netflix-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Netflix Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "961D16FE-6622-528C-B6B1-A0D39036160A",
              "query" : {
                "identifier" : "snoak|latest-netflix-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Netflix Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Netflix"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/JzkSVMTy\/prime-video.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "c8176946-6e54-4462-87cf-6760b32d2971",
          "query" : {
            "identifier" : "snoak|latest-amazon-prime-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "11140975-CADB-5987-8BD6-C101A85B6899",
              "query" : {
                "identifier" : "snoak|latest-amazon-prime-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Amazon Prime Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "29672575-5FC0-578C-8779-08E158F730FE",
              "query" : {
                "identifier" : "snoak|latest-amazon-prime-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Amazon Prime Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Prime Video"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/j5vJxWqT\/apple-tv.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "40b2ebc1-7cf8-4a0f-96b2-433edbe4d52a",
          "query" : {
            "identifier" : "snoak|latest-apple-tv-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "9039C5AA-E528-52E4-B516-83FB67E82BEE",
              "query" : {
                "identifier" : "snoak|latest-apple-tv-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Apple TV+ Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "0640F2A7-A287-59D9-9A83-4D43C872AF8B",
              "query" : {
                "identifier" : "snoak|latest-apple-tv-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Apple TV+ Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Apple TV"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/pTknW9VP\/disney.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "0c376b34-e281-41a9-8176-7aed8f9dd606",
          "query" : {
            "identifier" : "snoak|latest-disney-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "ACE030A5-654E-5875-897D-7253B0819EB3",
              "query" : {
                "identifier" : "snoak|latest-disney-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Disney+ Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "CB002ABE-2535-5E42-8035-0825DDF52270",
              "query" : {
                "identifier" : "snoak|latest-disney-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Disney+ Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Disney+"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/gJ46zwcm\/paramount.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "c33aff93-382c-4c79-940d-d0cfa1b69d80",
          "query" : {
            "identifier" : "snoak|latest-paramount-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "04D79B30-E060-5AF5-825B-0C8E4606F753",
              "query" : {
                "identifier" : "snoak|latest-paramount-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Paramount+ Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "7FFEECE6-7C00-51C2-9B0F-F69FE5235990",
              "query" : {
                "identifier" : "snoak|latest-paramount-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Paramount+ Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Paramount+"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/3R9D8yr8\/hbo-max.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "0656de84-b29d-4009-9965-b63e58234977",
          "query" : {
            "identifier" : "snoak|latest-hbo-max-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "CCECB738-1147-5F4A-B9F8-F2DB2DB351C8",
              "query" : {
                "identifier" : "snoak|latest-hbo-max-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest HBO Max Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "1C285D14-89DF-5BBF-A4D5-FAFD378CC655",
              "query" : {
                "identifier" : "snoak|latest-hbo-max-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest HBO Max Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "HBO Max"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/bNM4BsR1\/hulu.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "58eeaeed-0f1a-4d89-b1a0-e83e21d9e5e3",
          "query" : {
            "identifier" : "snoak|latest-hulu-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "368404F2-60CC-547C-9F80-137970E2CAD2",
              "query" : {
                "identifier" : "snoak|latest-hulu-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Hulu Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "AC000945-5D00-5811-8462-7B85E1133EE7",
              "query" : {
                "identifier" : "snoak|latest-hulu-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Hulu Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Hulu"
        }
      ],
      "id" : "E91FCE29-CC55-54B5-8CB4-94D9F8605896",
      "isEnabled" : true,
      "position" : 3,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "wide-backdrop-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|latest-netflix-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Latest Streaming Services"
    },
    {
      "dataSource" : {
        "identifier" : "cedar.branch-group",
        "kind" : "custom",
        "parameters" : {
          "cedar.home.displaysFolderCards" : "true",
          "cedar.home.folderRole" : "folder",
          "cedar.home.leafBrowseLayout" : "chips-and-grid"
        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/D06yHczT\/EBR-TVA-WW-ACTION.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "9877C63C-072D-4CEF-9CEE-57C8FFAC072F",
          "query" : {
            "identifier" : "snoak|latest-action-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "C094EAB5-9AAD-5733-B112-D515F869E211",
              "query" : {
                "identifier" : "snoak|latest-action-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Action Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "FD40F41F-07B0-57F0-9F87-D6016A00EA56",
              "query" : {
                "identifier" : "snoak|latest-action-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Action Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Action"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/mkj2JSrf\/EBR-TVA-WW-ANIMATION.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "ECD50011-D94E-443D-BC00-18AA772D20FA",
          "query" : {
            "identifier" : "snoak|latest-animation-anime-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "4CCFB5BA-F8EA-5C2E-8F6F-E0B7320FBA0C",
              "query" : {
                "identifier" : "snoak|latest-animation-anime-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Animation\/Anime Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "63E3CF71-36D4-5ACB-9389-E69F17C825E1",
              "query" : {
                "identifier" : "snoak|latest-animation-anime-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Animation\/Anime Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Animation"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/Y0RqZxC5\/EBR-TVA-WW-COMEDY.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : false,
          "id" : "14D1F1A3-6231-4004-A6D2-6C91EC71129E",
          "query" : {
            "identifier" : "snoak|latest-comedy-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "A6EB3576-9374-5061-91A3-90810B9758B7",
              "query" : {
                "identifier" : "snoak|latest-comedy-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Comedy Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "3E3B4997-0C9D-55E6-AFFE-F91B2F2408FC",
              "query" : {
                "identifier" : "snoak|latest-comedy-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Comedy Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Comedy"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/Fzps8xKt\/EBR-TVA-WW-DOCUMENTARY.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : false,
          "id" : "DBEAC001-FA86-4683-A468-B896BBC5D540",
          "query" : {
            "identifier" : "snoak|latest-documentary-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "A8C4BE11-B2ED-544E-B1FB-F7905D1B5698",
              "query" : {
                "identifier" : "snoak|latest-documentary-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Documentary Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "A4421F98-B366-59EB-B8AC-404DD05063A5",
              "query" : {
                "identifier" : "snoak|latest-documentary-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Documentary Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Documentary"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/6qc5ghpF\/EBR-TVA-WW-DRAMA-Final.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "3B47A83E-D6FE-4547-8392-65A46B23BE9E",
          "query" : {
            "identifier" : "snoak|latest-drama-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "A976BDF4-3A1B-52E9-8EC5-EE01461526BB",
              "query" : {
                "identifier" : "snoak|latest-drama-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Drama Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "4F258419-F45F-5F8E-984A-149EC8F9B058",
              "query" : {
                "identifier" : "snoak|latest-drama-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Drama Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Drama"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/vTbZ0KGy\/EBR-TVA-WW-HORROR.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "063AEB45-AEAD-4747-BC62-E868270906ED",
          "query" : {
            "identifier" : "snoak|latest-horror-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "F8405E3B-1371-582A-9223-0E79BBCCA848",
              "query" : {
                "identifier" : "snoak|latest-horror-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Horror Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "06A3B881-C085-501F-9548-CCDADC11D5D5",
              "query" : {
                "identifier" : "snoak|latest-horror-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Horror Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Horror"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/d36tp9VS\/EBR-TVA-WW-ROMANCE.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "EFF2315D-65B7-4FC7-B99F-4EA8808E009D",
          "query" : {
            "identifier" : "snoak|latest-romance-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "1294F0FE-C8DD-58B5-BFCD-CEFD64D59C6F",
              "query" : {
                "identifier" : "snoak|latest-romance-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Romance Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "D729D6DD-1144-5682-91A0-DC978C4F5754",
              "query" : {
                "identifier" : "snoak|latest-romance-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Romance Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Romance"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/3NYxtq3T\/EBR-TVA-WW-SCIFI.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "F98912E6-4DA7-4473-84BC-886F3E82DB75",
          "query" : {
            "identifier" : "snoak|latest-sci-fi-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "CAFBD821-1E35-51B4-8D47-08BEAF63DCF6",
              "query" : {
                "identifier" : "snoak|latest-sci-fi-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Sci-Fi Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "957301FC-D9E3-53A9-931D-4A91B64C34F3",
              "query" : {
                "identifier" : "snoak|latest-sci-fi-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Sci-Fi Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Sci-Fi"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/QChdfzjr\/EBR-TVA-WW-THRILLER.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "BAE1B48F-9E7A-4D0D-AC0F-396397885EDE",
          "query" : {
            "identifier" : "snoak|latest-thriller-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "D7000982-4CA0-562D-AC93-D16BE2631D43",
              "query" : {
                "identifier" : "snoak|latest-thriller-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Thriller Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "8EA23C26-B5FC-513A-84B6-647EDCFC5D40",
              "query" : {
                "identifier" : "snoak|latest-thriller-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Latest Thriller Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Thriller"
        }
      ],
      "id" : "2882407A-718B-52E7-A059-C51C67ED1DF3",
      "isEnabled" : true,
      "position" : 4,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "wide-backdrop-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|latest-action-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Latest Genres"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "03B6E882-5CD6-558F-9D60-AA0C7586EF51",
      "isEnabled" : true,
      "position" : 5,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-netflix-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Netflix Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "CFE5BF44-2478-5272-81FE-DD5737672EFA",
      "isEnabled" : true,
      "position" : 6,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-netflix-shows",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Netflix Shows"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "99DFEB79-DFE3-501A-B576-55925DCBD3B9",
      "isEnabled" : true,
      "position" : 7,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-amazon-prime-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Amazon Prime Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "6051CF51-F82A-557D-8F24-D33769409FED",
      "isEnabled" : true,
      "position" : 8,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-amazon-prime-shows",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Amazon Prime Shows"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "4D770829-F099-5671-8F69-DF8D163D7AFB",
      "isEnabled" : true,
      "position" : 9,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-apple-tv-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Apple TV+ Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "BC532814-29B1-5211-9BAB-FAE4303FFF0C",
      "isEnabled" : true,
      "position" : 10,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-apple-tv-shows",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Apple TV+ Shows"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "05EEF4A1-B2A9-5ECD-848E-1D87834F6C4F",
      "isEnabled" : true,
      "position" : 11,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-disney-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Disney+ Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "E377D6C2-F586-5A2A-AE7F-A891F492C5AE",
      "isEnabled" : true,
      "position" : 12,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-disney-shows",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Disney+ Shows"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "EB87B50C-30BA-5F74-83B4-3FAF2F69CE53",
      "isEnabled" : true,
      "position" : 13,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-paramount-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Paramount+ Movies"
    },
    {
      "dataSource" : {
        "identifier" : "trakt-public",
        "kind" : "trackingService",
        "parameters" : {

        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [

      ],
      "id" : "2A105B48-2DEB-58A3-880F-3926A59716E4",
      "isEnabled" : true,
      "position" : 14,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "poster-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|top-paramount-shows",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Top Paramount+ Shows"
    },
    {
      "dataSource" : {
        "identifier" : "cedar.branch-group",
        "kind" : "custom",
        "parameters" : {
          "cedar.home.displaysFolderCards" : "true",
          "cedar.home.folderRole" : "folder",
          "cedar.home.leafBrowseLayout" : "chips-and-grid"
        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/D06yHczT\/EBR-TVA-WW-ACTION.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "5fb8095e-d7b8-42b8-ba1c-1c4a82cee899",
          "query" : {
            "identifier" : "snoak|popular-action-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "C8DE9A55-8DDF-5B3A-ACE6-9E36322F1A34",
              "query" : {
                "identifier" : "snoak|popular-action-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Action Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "0B8BB10B-E160-526F-9419-EF510E4F7929",
              "query" : {
                "identifier" : "snoak|popular-action-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Action Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Action"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/mkj2JSrf\/EBR-TVA-WW-ANIMATION.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "c379a941-015e-4468-a566-16d4fe58ddf4",
          "query" : {
            "identifier" : "snoak|popular-animation-anime-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "FE852315-3F89-51E2-9EB5-F98018DABA9C",
              "query" : {
                "identifier" : "snoak|popular-animation-anime-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Animation\/Anime Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "5964142D-0AFF-5B37-8AD0-36BF018D30B1",
              "query" : {
                "identifier" : "snoak|popular-animation-anime-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Animation\/Anime Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Animation"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/Y0RqZxC5\/EBR-TVA-WW-COMEDY.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "f42363a1-b40d-4577-9729-90b2569ce8b4",
          "query" : {
            "identifier" : "snoak|popular-comedy-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "BD9C96A4-9CFB-57BC-8059-68CF7C08AC9A",
              "query" : {
                "identifier" : "snoak|popular-comedy-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Comedy Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "4F0BE0BC-DE7E-5951-8150-1486A4BF8F4F",
              "query" : {
                "identifier" : "snoak|popular-comedy-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Comedy Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Comedy"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/Fzps8xKt\/EBR-TVA-WW-DOCUMENTARY.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "e8c4f0eb-14dc-42fc-b682-7a3620f4416b",
          "query" : {
            "identifier" : "snoak|popular-documentary-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "6F05653E-F9D3-5BA1-AB7D-890D1C38F923",
              "query" : {
                "identifier" : "snoak|popular-documentary-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Documentary Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "73B0C8D2-AD52-5626-8493-4F407B8375A0",
              "query" : {
                "identifier" : "snoak|popular-documentary-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Documentary Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Documentary"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/6qc5ghpF\/EBR-TVA-WW-DRAMA-Final.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "a2b75798-ebdc-434a-925c-5bc621c1df57",
          "query" : {
            "identifier" : "snoak|popular-drama-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "CB9B850F-F366-56D6-BDF0-A8AAFD4DECD0",
              "query" : {
                "identifier" : "snoak|popular-drama-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Drama Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "6DD15927-4E29-57D3-85D4-FE08A5B0E53D",
              "query" : {
                "identifier" : "snoak|popular-drama-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Drama Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Drama"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/vTbZ0KGy\/EBR-TVA-WW-HORROR.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "d70e69c1-fd38-4566-8e29-f664497b94e9",
          "query" : {
            "identifier" : "snoak|popular-horror-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "909982EA-E400-57A2-8E82-0CF1CE2C301C",
              "query" : {
                "identifier" : "snoak|popular-horror-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Horror Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "FE257FFB-2701-5BF7-9FCC-9702F2142531",
              "query" : {
                "identifier" : "snoak|popular-horror-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Horror Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Horror"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/d36tp9VS\/EBR-TVA-WW-ROMANCE.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "30353d13-4418-46a5-b0e6-d25bf182be52",
          "query" : {
            "identifier" : "snoak|popular-romance-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "E3514F87-271B-5FEF-8BAF-68348F00AEE9",
              "query" : {
                "identifier" : "snoak|popular-romance-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Romance Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "3EC1FA04-BD03-55D4-98FD-E9B73BC7438E",
              "query" : {
                "identifier" : "snoak|popular-romance-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Romance Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Romance"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/3NYxtq3T\/EBR-TVA-WW-SCIFI.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "e45513c9-fd57-4acd-9556-92e6902818d6",
          "query" : {
            "identifier" : "snoak|popular-sci-fi-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "D5FD6EFB-CA71-5259-AE38-26E623777AEF",
              "query" : {
                "identifier" : "snoak|popular-sci-fi-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Sci-Fi Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "A35718DE-834F-53BE-9566-0484A995BED4",
              "query" : {
                "identifier" : "snoak|popular-sci-fi-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Sci-Fi Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Sci-Fi"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/QChdfzjr\/EBR-TVA-WW-THRILLER.webp",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "4da74c56-cf60-4fdd-8d21-3d84458dd79e",
          "query" : {
            "identifier" : "snoak|popular-thriller-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "68E6B52A-782B-5FD3-8F36-9F76B117C335",
              "query" : {
                "identifier" : "snoak|popular-thriller-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Thriller Movies"
            },
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "E29811CA-09BD-5F10-9448-EF195EE5C202",
              "query" : {
                "identifier" : "snoak|popular-thriller-shows",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular Thriller Shows"
            }
          ],
          "tileShape" : "landscape",
          "title" : "Thriller"
        }
      ],
      "id" : "C88E4D35-2BD8-5DD0-918F-B45395FF4C06",
      "isEnabled" : true,
      "position" : 15,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "wide-backdrop-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|popular-action-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Popular Genres"
    },
    {
      "dataSource" : {
        "identifier" : "cedar.branch-group",
        "kind" : "custom",
        "parameters" : {
          "cedar.home.displaysFolderCards" : "true",
          "cedar.home.folderRole" : "folder",
          "cedar.home.leafBrowseLayout" : "chips-and-grid"
        }
      },
      "defaultFilters" : {
        "contentType" : "both",
        "countryCodes" : [

        ],
        "genreIDs" : [

        ],
        "networkIDs" : [

        ],
        "originalLanguageCodes" : [

        ],
        "productionCompanyIDs" : [

        ],
        "streamingProviderIDs" : [

        ]
      },
      "folderOptions" : [
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/L5jnk6gT\/20s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "e9b3ec09-7613-4193-ad25-41b9261178ae",
          "query" : {
            "identifier" : "snoak|popular-2020s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "341A0810-82D3-56C7-ADAD-C580BEFA53D5",
              "query" : {
                "identifier" : "snoak|popular-2020s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 2020s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "20s Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/br1s0NSR\/10s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "22667ac4-87c9-4ef1-961f-6a1898681669",
          "query" : {
            "identifier" : "snoak|popular-2010s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "97F54D86-4708-571C-AE4B-22E7F8FFBE22",
              "query" : {
                "identifier" : "snoak|popular-2010s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 2010s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "10s Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/RhwN1VJK\/00s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "c72e3bd7-0ad6-425b-936c-97c583b441ba",
          "query" : {
            "identifier" : "snoak|popular-2000s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "4D0571F7-A0C2-5913-BB4C-7678BC478C49",
              "query" : {
                "identifier" : "snoak|popular-2000s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 2000s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "00s Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/J7XDCKYH\/90s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "2dd74771-006e-40d1-9db3-819447299076",
          "query" : {
            "identifier" : "snoak|popular-1990s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "E650009C-238E-5667-BA2B-A988DDD0A2E9",
              "query" : {
                "identifier" : "snoak|popular-1990s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 1990s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "90s Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/qBKhHQDz\/80s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "3f830227-d7f5-4d55-b435-295b8db76d09",
          "query" : {
            "identifier" : "snoak|popular-1980s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "60584BB0-EBCC-5B67-AF6E-6335BB1C0BC9",
              "query" : {
                "identifier" : "snoak|popular-1980s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 1980s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "80s Movies"
        },
        {
          "coverImageURL" : "https:\/\/i.postimg.cc\/VvXd9L0j\/70s.png",
          "dataSource" : {
            "identifier" : "trakt-public",
            "kind" : "trackingService",
            "parameters" : {

            }
          },
          "filters" : {
            "contentType" : "both",
            "countryCodes" : [

            ],
            "genreIDs" : [

            ],
            "networkIDs" : [

            ],
            "originalLanguageCodes" : [

            ],
            "productionCompanyIDs" : [

            ],
            "streamingProviderIDs" : [

            ]
          },
          "hidesTitle" : true,
          "id" : "00fd8a01-cba8-4166-a0aa-08b5ddd2083a",
          "query" : {
            "identifier" : "snoak|popular-1970s-movies",
            "kind" : "curatedList",
            "parameters" : {

            }
          },
          "sources" : [
            {
              "dataSource" : {
                "identifier" : "trakt-public",
                "kind" : "trackingService",
                "parameters" : {

                }
              },
              "filters" : {
                "contentType" : "both",
                "countryCodes" : [

                ],
                "genreIDs" : [

                ],
                "networkIDs" : [

                ],
                "originalLanguageCodes" : [

                ],
                "productionCompanyIDs" : [

                ],
                "streamingProviderIDs" : [

                ]
              },
              "id" : "D1A8FAE8-6DE0-5822-8763-E39845CCD0BC",
              "query" : {
                "identifier" : "snoak|popular-1970s-movies",
                "kind" : "curatedList",
                "parameters" : {

                }
              },
              "title" : "Popular 1970s Movies"
            }
          ],
          "tileShape" : "landscape",
          "title" : "70s Movies"
        }
      ],
      "id" : "FDFE2229-FFD5-58E3-9BCE-74291C3EBC3A",
      "isEnabled" : true,
      "position" : 16,
      "presentation" : {
        "enhancedPostersEnabled" : false,
        "ratings" : {
          "isEnabled" : false,
          "providerIDs" : [

          ]
        },
        "templateID" : "wide-backdrop-carousel"
      },
      "profileID" : "00000000-0000-0000-0000-000000000000",
      "query" : {
        "identifier" : "snoak|popular-2020s-movies",
        "kind" : "curatedList",
        "parameters" : {

        }
      },
      "schemaVersion" : 2,
      "title" : "Popular Decades"
    }
  ],
  "bundleID" : "EEF15CF5-D85F-422E-8F05-E647A430BCAB",
  "createdAt" : "2026-10-11T14:18:02Z",
  "formatIdentifier" : "app.cedar.bundle",
  "generator" : {
    "application" : "Cedar Creator"
  },
  "kind" : "branches",
  "schemaVersion" : 1,
  "title" : "snoak 🐐 Full Setup"
}