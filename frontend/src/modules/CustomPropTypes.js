import PropTypes from 'prop-types';

const wishlist = PropTypes.shape({
  item_id: PropTypes.number,
  prio: PropTypes.number,
});

const player = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  rank: PropTypes.number,
  class: PropTypes.string,
  role: PropTypes.string,
  notes: PropTypes.string,
  attendance: PropTypes.arrayOf(PropTypes.number),
  wishlist: PropTypes.arrayOf(wishlist),
});

const item = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  type: PropTypes.string,
  // TODO: Standardize these as a number
  tier: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  notes: PropTypes.string,
  raid: PropTypes.number,
  bosses: PropTypes.arrayOf(PropTypes.string),
  class_prio: PropTypes.arrayOf(PropTypes.shape({
    class: PropTypes.string,
    prio: PropTypes.number,
    set_by: PropTypes.number,
  })),
  individual_prio: PropTypes.arrayOf(PropTypes.shape({
    player_id: PropTypes.number,
    prio: PropTypes.number,
    set_by: PropTypes.number,
  })),
});

const lootHistory = PropTypes.shape({
  id: PropTypes.number,
  item_id: PropTypes.number,
  player_id: PropTypes.number,
  raid_day_id: PropTypes.number,
});

const raid = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  short_name: PropTypes.string,
  bosses: PropTypes.arrayOf(PropTypes.string),
});

const raidDay = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  date: PropTypes.string,
  raid_id: PropTypes.number,
});

const user = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  permission_level: PropTypes.number,
});

const CustomPropTypes = {
  wishlist,
  player,
  item,
  lootHistory,
  raid,
  raidDay,
  user,
}

export default CustomPropTypes;
