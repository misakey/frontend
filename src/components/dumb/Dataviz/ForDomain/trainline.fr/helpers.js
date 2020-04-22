import moment from 'moment';

import calcDistanceFromCoordinates from 'helpers/calcDistanceFromCoordinates';

import isNil from '@misakey/helpers/isNil';
import rangeRight from '@misakey/helpers/rangeRight';

const getYears = (account) => {
  const thisYear = moment().year();
  let signupYear;
  if (!isNil(account.signed_up_at)) {
    signupYear = moment(account.signed_up_at).year();
  } else if (account.sessions.length > 0) {
    signupYear = moment(account.sessions[account.sessions.length - 1].started_at).year();
  } else {
    signupYear = thisYear;
  }
  return rangeRight(signupYear, thisYear + 1);
};

const getTopDestinations = (travels) => {
  const destinationsWithTotalVisit = travels.reduce((acc, val) => {
    const arrivalStation = val.legs[val.legs.length - 1].arrival;
    return {
      ...acc,
      [arrivalStation.public_id]: (isNil(acc[arrivalStation.public_id]))
        ? { ...arrivalStation, totalVisit: 1 }
        : {
          ...acc[arrivalStation.public_id],
          totalVisit: acc[arrivalStation.public_id].totalVisit + 1,
        },
    };
  }, {});
  return Object
    .values(destinationsWithTotalVisit)
    .sort((a, b) => b.totalVisit - a.totalVisit);
};

// The search is not anymore in the data we show to user. But the work to clean up has been done
// I comment this to keep a trace (if we update soon the dataviz)
// If you see this comment far from now, you can delete the code
// const getTopSearches = (searches) => {
//   const searchesWithTotalVisit = searches.reduce((acc, val) => {
//     const arrivalStation = val.arrival;
//     return {
//       ...acc,
//       [arrivalStation.public_id]: (isNil(acc[arrivalStation.public_id]))
//         ? { ...arrivalStation, totalSearch: 1 }
//         : {
//           ...acc[arrivalStation.public_id],
//           totalSearch: acc[arrivalStation.public_id].totalSearch + 1,
//         },
//     };
//   }, {});
//   return Object
//     .values(searchesWithTotalVisit)
//     .sort((a, b) => b.totalSearch - a.totalSearch);
// };

const getTimeInTrain = (travels) => travels.reduce(
  (acc, travel) => {
    const travelDuration = travel.legs.reduce(
      (a, l) => a.add(moment(l.arrival_date).diff(moment(l.departure_date))),
      moment.duration(0),
    );
    return acc.add(travelDuration);
  },
  moment.duration(0),
);

const getDistance = (travels) => travels.reduce(
  (acc, travel) => {
    const travelDistance = travel.legs.reduce(
      (a, leg) => a + calcDistanceFromCoordinates(
        leg.departure.latitude, leg.departure.longitude,
        leg.arrival.latitude, leg.arrival.longitude,
      ),
      0,
    );
    return acc + travelDistance;
  },
  0,
);

const getCo2 = (travels) => travels.reduce(
  (acc, travel) => acc + travel.legs.reduce((a, l) => a + l.co2_emission, 0),
  0,
);

const getCost = (travels) => travels.reduce(
  (acc, travel) => acc + travel.price.cents,
  0,
);

export const getDataPerYear = (data) => {
  const { account, pnrs } = data;

  if (isNil(account) || isNil(pnrs)) {
    return null;
  }


  const years = getYears(account);

  const confirmedTravels = pnrs.filter((travel) => travel.status === 'emitted' && !travel.cancelled);

  const travelsPerYear = Object.fromEntries(years.map((year) => {
    const travelsOfTheYear = confirmedTravels.filter(
      (travel) => moment(travel.legs[0].departure_date).year() === year,
    );
    return [year, travelsOfTheYear];
  }));

  // The search is not anymore in the data we show to user. But the work to clean up has been done
  // I comment this to keep a trace (if we update soon the dataviz)
  // If you see this comment far from now, you can delete the code
  // const searchesPerYear = Object.fromEntries(years.map((year) => {
  //   const searchesOfTheYear = searches.filter(
  //     (search) => moment(search.searched_at).year() === year,
  //   );
  //   return [year, searchesOfTheYear];
  // }));

  return years.map((year) => {
    const travelsOfTheYear = travelsPerYear[year];

    return {
      year,
      topDestination: getTopDestinations(travelsOfTheYear).slice(0, 3),
      timeInTrain: getTimeInTrain(travelsOfTheYear),
      distance: Math.round(getDistance(travelsOfTheYear)),
      co2: Math.round(getCo2(travelsOfTheYear) / 1000),
      totalTravels: travelsOfTheYear.length,
      moneySpent: Math.round(getCost(travelsOfTheYear) / 100),
    };
  }).filter(({ topDestination }) => (topDestination.length > 0));
};
