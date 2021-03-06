"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const showParams = { params: { q: term } }
  const response = await axios.get(`https://api.tvmaze.com/search/shows`,
    showParams);
  let shows = [];
  for (let showData of response.data) {
    console.log(showData);
    shows.push(
      {
        id: showData.show.id,
        name: showData.show.name,
        summary: showData.show.summary,
        image: showData.show.image
          ? showData.show.image.original
          : "https://tinyurl.com/tv-missing",
      });
  }
  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}"
              class= "w-25 me-3" >
      <div class="media-body">
        <h5 class="text-primary">${show.name}</h5>
        <div><small>${show.summary}</small></div>
        <button class="btn btn-outline-light btn-sm Show-getEpisodes">
          Episodes
        </button>
      </div>
         </div >  
       </div >
      `);
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  const episodes = response.data.map(function (episodeData) {
    return {
      id: episodeData.id,
      name: episodeData.name,
      season: episodeData.season,
      number: episodeData.number
    };
  });

  return episodes;
}


/** Given a list of episode objects, empty the previous list, add the Episode 
 * information in the dom under #episodesList, then show the Episode area
 */

function displayEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(`<li> ${episode.name} (season ${episode.season}, 
      number ${episode.number}) </li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

$("#showsList").on("click", ".Show-getEpisodes", async function (evt) {
  const id = $(evt.target).parents(".Show").attr('data-show-id');
  searchForEpisodeAndDisplay(id);
});

/** Given a show id, searches for episodes and displays them in episode list */

async function searchForEpisodeAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);
  displayEpisodes(episodes);
}