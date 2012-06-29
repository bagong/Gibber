notation.balungan = {
  wilujeng: {
    ladrang: {
      p7: {
        buka: "7.32 6.7.23 7.7.32 -7.5.6.@",
        umpak: "27.23 27.5.6.) 33--^ 6532) 5653^ 27.5.6.) 27.23^ 27.5.6.@",
        ngelik: "--6- 7576) 3567^ 6532) 66--^ 7576) 7732^ -7.5.6.@"
      },
      p5: {
        buka: "6.21 5.6.12 6.6.21 -6.4.5.@",
        umpak: "16.12 16.4.5.) 22--^ 5421) 4542^ 16.4.5.) 16.12^ 16.4.5.@",
        ngelik: "--5- 6465) 2456^ 5421) 55--^ 6465) 6621^ -6.4.5.@"
      },
      sm: {
        buka: "132 6.123 1132 -126.@",
        umpak: "2123 2126.) 33--^ 6532) 5653^ 2126.) 2123^ 2126.@",
        ngelik: "--6- 1'51'6) 3561'^ 6532) 66--^ 1'51'6) 1'1'32^ -126.@"
      }
    }
  }
};
notation.bonangan = {
  "s6" : {},
  "s9" : {},
  "sm" : {},
  "p5" : {},
  "p6" : {},
  "p7" : {
    "irI" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.2- 27.2- 5.7.5.- 6.6.5.6."],
                ["27.5.- 5.7.5.- 5.7.5.- 6.6.7.6."]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6--"],
                ["27.6.6. 6--6 --6- -6--"]
              ],
              "3" : []
            },
            "gantH" : {
              "6" : [
                ["27.6.6. 6-6.6"],
                ["27.6.6. 6--6"]
              ],
              "7" : []
            }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.5.- 6.6.7.6."],
                ["27.5.6. 6.7.-6."],
                ["27.5.- 6.7.-6."],
                ["27.5.- 6.7.--"]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6"],
                ["27.6.6. 6--6"]
              ],
              "3" : []
            },
            "gantH" : {
              "6" : [],
              "7" : []
            }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    },
    "irII" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.2- 27.2- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 6.6.7.6."],
                ["275.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.6.5.- 6.7.-6."]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6-6. 6-6.6 -6.6- 6.6-6. 6-6.6"],
                ["27.6.6. 6--6 --6- -6-- 6--6 --6- -6-- 6--6"]
                ],
              "3" : []
            },
            "gantH" : {
              "6" : [
                ["27.6.6. 6--6 --6- -6--"],
                ["27.6.6. 6-6.6 -6.6- 6.6--"]
              ],
              "7" : []
            }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.5.5. 5.7.-- 5.7.5.- 6.6.7.6."],
                ["27.5.5. 5.7.-- 5.7.5.6. 6.7.-6."]
              ],
            },
            "gantF" : {
              "3" : [],
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6--"],
                ["27.6.6. 6--6 --6- -6--"]
              ],
            },
            "gantH" : {
              "6" : [
                ["27.6.6.6-6.6"],
                ["27.6.6.6--6"]
              ],
              "7" : [],
            }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    }
  },
  "generic" : {
    "irI" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "gantF" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,undefined]
            ] },
            "gantH" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function(w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "gantF" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "gantH" : function(z) { return [
              [z,z,z,undefined],
              [z,undefined,undefined,z]
            ] },
            "pipF" : function(w,x,y,z) { return [
              [w,x,w,x,y,z,y,z]
            ] },
            "pipH" : function(y,z) { return [
              [y,z,y,z]
            ] }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    },
    "irII" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "gantF" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "gantH" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z],
              [z,z,z,undefined,z,z,undefined,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function (w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,undefined,w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,w,x,w,undefined,w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "gantF" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,undefined]
            ] },
            "gantH" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function (w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    }
  }
};
notation.kendhangan = {
  kdhGendhing : {},
  ketipung : {},
  kendhangKal : {
    lancaran : {
      ir0 : {
        buka : "ttpbpppp",
        adjust : ".p.p.p.p.p.p.p.p",
        regular : "pppppbpppbpppbpp",
        salahan : "bppbppbppbpppbpp",
        suwuk : "p.p.pbp.bp.b.p.."
      },
      irI : {
        buka : "ktktkpabaappapap",
        regular : "p.bp.bp.b.pb.p.ppbp.b.pbp.pb.p.b",
        suwuk : ".p...p...p.b.p...b.p...b...p...."
      },
      irII : {
        regular : "p.bp.bp.b.pb.p.pp.bp.bp.b.pb.p.pp.bp.bp.b.pb.p.ppbp.b.pbp.pb.p.b"
      }
    },
    ketawang : {},
    ladrang : {
      irI: {
        buka : "kktktkpoboobpoobp",
        umpak : "kobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobppbpobopbkobpkobp",
        ngelik : "kobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobppbpobopbkobpkobp",
        suwuk : "kobpkobpkobpkobpkobpkobpkbkpkokbapaktbapktbapaktbapaktabkokpkok."
      },
      irII: {
        umpak : ".kokokokokokokopapaabpab.kokokokoobpoobpoopbpabp.kokokopab.ktpabapab.kopaapb.kotppapapabapaapbapoopbopbopbpobopb.kokokoppapbapab",
        ngelik : "kpbpabapoopbopbopbpobopb.kokobapoopbopboppopobop.kokokopabaktpabapab.kopoopb.kotppopopobopoopbop.kpbapbapbpabapb.kokokoppapbapab",
        suwuk : "kpbpabapoopbopbopbpobopb.kokobapoopbopboppopobopapabakopoboktpobapobkokpkopbkoktppapapabapaktbapaktbapaktbapapabakkokkkokkk....."
      },
      irIII : {}
    }
  },
  ciblon : {},
  kosekWayang : {},
  kosekHalus : {}
};

