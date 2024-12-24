// import { ethers } from "ethers";

/**  Displays the first and last 4 characters of a given address */
export const shortAdd = (address) => {
  return address.slice(0, 4) + "..." + address.slice(-4);
};

/**  Displays the first and last 10 characters of a given address */
export const longAdd = (address) => {
  return address.slice(0, 15) + "..." + address.slice(-15);
};

export function formatDate(timestamp) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const suffix = getDaySuffix(day);

  return `${month} ${day}${suffix}, ${year}`;
}

export function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function extractTopLevelErrorMessage(error) {
  // Check if the 'Error' property exists in the error object
  if (error && error.Error) {
    return error.Error;
  } else {
    return "No top-level error message found.";
  }
}

export function trimToTwoDecimals(num) {
  if (num === undefined) return "";
  var numStr = num?.toString();
  var parts = numStr?.split(".");

  if (parts.length === 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  } else {
    return numStr;
  }
}

export function trimToNoDecimals(num) {
  if (num === undefined) return "";

  var numStr = num?.toString();
  var parts = numStr?.split(".");

  return parts[0];
}

export function formatNumberWithCommas(number) {
  if (number === undefined) return "";
  return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // for smooth scrolling
  });
};

// export const fromBn = (num) => {
//   return Number(ethers.utils.formatUnits(num, 18));
// };

// export const fromBnPrecise = (num, decimal) => {
//   const val = Number(ethers.utils.formatUnits(num, 18));

//   const number =
//     Math.trunc(val * Math.pow(10, decimal)) / Math.pow(10, decimal);

//   return Number(number);
// };

// export const fromBn18 = (num) => {
//   return Number(ethers.utils.formatUnits(num, 0)).toFixed(0);
// };

// export const toBn = (num) => {
//   return ethers.utils.parseEther(num.toString());
// };
