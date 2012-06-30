tafsiran = {
  bonang : {
    mbuka : function(balungan,cnt) {
      var buka = [];
      for (var i = 0; i < cnt; i = i+4) {
        var gatra = balungan.slice(i,i+4);
        var w = gatra[0];
        var x = gatra[1];
        var y = gatra[2];
        var z = gatra[3];
        switch (true) {
          case i === cnt-4 && z === degree("6.") :
            var ligatur = degreesNut("7._5._6._7._6.");
            buka.push(w);
            buka = buka.concat(ligatur);
            break;
          default :
            buka.push(w,x,y,z);
        }
      }
      return buka;
    },
    mipil : function(balungan,cnt,nutRoot,nutRootGen,segment) {
      segment = segment || flags.segment;
      var pipilan = [];
      var period = kar.gongan("gong");
      for (var i = 0; i < cnt; i = i+4) {
        var cengkok = []; var firstHalf = []; var secondHalf = []; var winner = []; var firstWinner = []; var secondWinner = [];
        var gatra = balungan.slice(i,i+4); // for now the match window is 1 gatra (4 tones of regularized balungan (protoBalungan)
        var prefix = (i===0) ? balungan.slice(cnt-1) : balungan.slice(i-1,i); // assumes pre- and postgong are the same
        var w = gatra[0];
        var x = gatra[1];
        var y = gatra[2];
        var z = gatra[3];
        var suffix = (i===(cnt-4)) ? balungan.slice(0,2) : balungan.slice(i+4,i+6); // circular again - cannot cross segment border yet - just two tones (protoBal) for now
        var balType = kar.balunganType(prefix,w,x,y,z,suffix[0]);
        switch (true) {
          case (w===x && y===z) : // full gantungan (easiest to identify)
            cengkok = cengkok.concat(nutRoot[balType].gantF[dia(z)]);
            cengkok = cengkok.concat(nutRootGen[balType].gantF(z));
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          case (w===x) : // halph gantungan at gatra-start continued by pipilan (full gantungan would have matched above)
            firstHalf = firstHalf.concat(nutRoot[balType].gantH[dia(x)]);
            firstHalf = firstHalf.concat(nutRootGen[balType].gantH(x));
            firstWinner = any(firstHalf);
            firstWinner = (firstWinner.length === 1) ? degreesNut(firstWinner[0]) : degreesNut(firstWinner);
            secondHalf = secondHalf.concat(nutRootGen[balType].pipH(y,z));
            secondWinner = any(secondHalf);
            secondWinner = (secondWinner.length === 1) ? degreesNut(secondWinner[0]) : degreesNut(secondWinner);
            pipilan = pipilan.concat(firstWinner).concat(secondWinner);
            break;
          case (y===z) : // halph gantungan at gatra-end preceded by pipilan (full gantungan would have matched above)
            firstHalf = firstHalf.concat(nutRootGen[balType].pipH(w,x));
            firstWinner = any(firstHalf);
            firstWinner = (firstWinner.length === 1) ? degreesNut(firstWinner[0]) : degreesNut(firstWinner);
            secondHalf = secondHalf.concat(nutRoot[balType].gantH[dia(z)]);
            secondHalf = secondHalf.concat(nutRootGen[balType].gantH(z));
            secondWinner = any(secondHalf);
            secondWinner = (secondWinner.length === 1) ? degreesNut(secondWinner[0]) : degreesNut(secondWinner);
            pipilan = pipilan.concat(firstWinner).concat(secondWinner);
            break;
          case (z===degree("5.")) && flags.goToNgelik && (i>period-8) && !flags.isGonganSuwuk :
          case (z===degree("6.")) && flags.goToNgelik && (i>period-8) && !flags.isGonganSuwuk :
            cengkok = cengkok.concat(nutRoot[balType].gantF[dia(z+7)]); // ngelik - 7 is standardized octave for pelog and also slendro!
            cengkok = cengkok.concat(nutRootGen[balType].gantF(z+7));
            winner = any(cengkok);
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          case (z===degree("6.")) :
            cengkok = cengkok.concat(nutRoot[balType].seleh[dia(z)]);
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          default :
            cengkok = cengkok.concat(nutRootGen[balType].pipF(w,x,y,z));
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
        }
      }
      return pipilan;
    }
  }
};
